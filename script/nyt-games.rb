# Log NYT Wordle and Connections results for the NYT Games band on the Shelf.
#
# NYT offers no source for one player's statistics, so the numbers come from what
# its apps show after a game: the share text, and, once, the Statistics screen.
# Results are stored one per puzzle in _data/shelf/nyt_results.yml. Every run
# recomputes the summary the page renders and dates it by the latest result it
# counts. Nothing is computed when the site is built or viewed.
#
# Log a game: copy the share text NYT offers after it, then
#
#   ruby script/nyt-games.rb log                 # reads the macOS clipboard
#   ruby script/nyt-games.rb log < results.txt   # or standard input
#
# The share text looks like
#
#   Wordle 1,598 4/6*            Connections
#   (a grid of five-square       Puzzle #873
#    rows, one per guess)        (a grid of four-square rows)
#
# A trailing * is hard mode and X/6 is a loss. In Connections a row of one colour
# is a solved group and a mixed row is a mistake; four mistakes is a loss.
# Several share texts pasted together are logged together, and logging a puzzle
# again replaces its entry. A result is dated from its puzzle number (Wordle 0
# was 19 June 2021, Connections 1 was 12 June 2023); --date YYYY-MM-DD overrides
# that for a single result.
#
# Set a baseline from NYT's Statistics screen, dated the day it was read, so the
# summary covers the games played before logging began. For example:
#
#   ruby script/nyt-games.rb baseline wordle --date 2026-11-03 --played 120 \
#     --win-pct 95 --current 4 --max 21 --distribution 0,9,38,45,19,3
#   ruby script/nyt-games.rb baseline connections --date 2026-11-03 --played 80 \
#     --win-pct 90 --current 6 --max 15 --mistakes 30,20,14,8,8
#
# --distribution is the six Wordle bars, 1 to 6 guesses, and is required.
# --mistakes is the Connections mistake chart, 0 to 3 mistakes (or 0 to 4, where
# 4 is the losses). Without it, --win-pct is required, --perfect may give the
# perfect puzzles, and the average number of mistakes and the mistake chart are
# left out. The statistics are taken to include the puzzle of --date; if they
# were read before that day's game, pass --puzzle with the previous day's
# number. Results up to the baseline's puzzle stay in the file but are not
# counted again. A new baseline replaces the old one.
#
# A streak runs over consecutive puzzle numbers, so a game that was played but
# not logged breaks it here even though NYT's own count goes on. Logging the
# missing result later, or setting a new baseline, mends it.
#
#   ruby script/nyt-games.rb drop wordle 1598    # remove one result
#   ruby script/nyt-games.rb check               # the summary matches the results
#   ruby script/nyt-games.rb check --fix         # rewrite it after a hand edit
#
# Every command takes --file PATH to work on another copy of the data file.

require 'date'
require 'optparse'
require 'yaml'

DEFAULT_FILE = File.expand_path('../_data/shelf/nyt_results.yml', __dir__)
GAMES = %w[wordle connections].freeze
WORDLE_ZERO = Date.new(2021, 6, 19)
CONNECTIONS_ONE = Date.new(2023, 6, 12)

# Share-grid squares, including the high-contrast palette (orange for a hit,
# blue for a letter in the wrong place).
WORDLE_SQUARES = ["⬛", "⬜", "\u{1F7E8}", "\u{1F7E9}", "\u{1F7E7}", "\u{1F7E6}"].freeze
WORDLE_HITS = ["\u{1F7E9}", "\u{1F7E7}"].freeze
CONNECTIONS_SQUARES = ["\u{1F7E8}", "\u{1F7E9}", "\u{1F7E6}", "\u{1F7EA}"].freeze
ALL_SQUARES = (WORDLE_SQUARES + CONNECTIONS_SQUARES).uniq.freeze

NUMBER = '(\d{1,3}(?:[,.   ]\d{3})+|\d+)'.freeze
WORDLE_HEAD = /\AWordle\s+#{NUMBER}\s+([1-6X])\/6(\*?)/i
CONNECTIONS_HEAD = /\AConnections\b/i
PUZZLE_LINE = /Puzzle\s*#\s*#{NUMBER}/i

RESULT_KEYS = {
  'wordle' => %w[puzzle date won guesses hard],
  'connections' => %w[puzzle date won mistakes]
}.freeze
BASELINE_KEYS = {
  'wordle' => %w[date puzzle played won current_streak max_streak distribution],
  'connections' => %w[date puzzle played won current_streak max_streak perfect mistakes]
}.freeze
SUMMARY_KEYS = {
  'wordle' => %w[as_of last_puzzle played won win_pct current_streak max_streak mean_guesses distribution],
  'connections' => %w[as_of last_puzzle played won win_pct current_streak max_streak perfect mean_mistakes mistakes]
}.freeze

HEADER = <<~YAML.freeze
  # NYT Wordle and Connections results, written by script/nyt-games.rb, whose
  # header explains how to log a game and how to set a baseline. Change it
  # through the script: the summary is recomputed from `baseline` and `results`
  # on every run, and the build checks fail if it stops matching them.
  #
  # `baseline` is NYT's Statistics screen as read on `date`, counting every
  # puzzle up to `puzzle`. `results` has one entry per puzzle, from the share
  # text, dated by puzzle number; entries up to the baseline's puzzle are kept
  # but not counted again. `summary` is what the Shelf page shows, true as of
  # `as_of`. With no baseline and no results it is null, and the page says no
  # results have been added.
YAML

class InputError < StandardError; end

def grouped(n)
  n.to_s.reverse.scan(/\d{1,3}/).join(',').reverse
end

def label(game, puzzle)
  game == 'wordle' ? "Wordle #{grouped(puzzle)}" : "Connections ##{grouped(puzzle)}"
end

def digits(text)
  text.gsub(/\D/, '').to_i
end

def puzzle_date(game, puzzle)
  game == 'wordle' ? WORDLE_ZERO + puzzle : CONNECTIONS_ONE + (puzzle - 1)
end

def puzzle_on(game, date)
  game == 'wordle' ? (date - WORDLE_ZERO).to_i : (date - CONNECTIONS_ONE).to_i + 1
end

def iso_date(text, what)
  raise InputError, "#{what} must be YYYY-MM-DD, not #{text.inspect}" unless text.to_s.match?(/\A\d{4}-\d{2}-\d{2}\z/)

  Date.iso8601(text)
rescue ArgumentError
  raise InputError, "#{what} is not a date: #{text.inspect}"
end

# --- Share text -------------------------------------------------------------

def square_row?(line)
  !line.empty? && line.each_char.all? { |c| ALL_SQUARES.include?(c) }
end

def parse_share(text)
  blocks = []
  current = nil
  text.each_line do |raw|
    line = raw.delete("️‍").strip
    next if line.empty?

    if (m = WORDLE_HEAD.match(line))
      current = { game: 'wordle', puzzle: digits(m[1]), result: m[2].upcase, hard: m[3] == '*', rows: [] }
      blocks << current
    elsif CONNECTIONS_HEAD.match?(line)
      m = PUZZLE_LINE.match(line)
      current = { game: 'connections', puzzle: m && digits(m[1]), rows: [] }
      blocks << current
    elsif current && current[:game] == 'connections' && current[:puzzle].nil? && (m = PUZZLE_LINE.match(line))
      current[:puzzle] = digits(m[1])
    elsif current && square_row?(line.gsub(/\s/, ''))
      current[:rows] << line.gsub(/\s/, '')
    end
  end
  raise InputError, 'No Wordle or Connections share text found in the input.' if blocks.empty?

  blocks.map { |b| b[:game] == 'wordle' ? wordle_result(b) : connections_result(b) }
end

def wordle_result(block)
  name = label('wordle', block[:puzzle])
  won = block[:result] != 'X'
  guesses = won ? block[:result].to_i : nil
  rows = block[:rows]
  unless rows.empty?
    bad = rows.find { |r| r.length != 5 || !r.each_char.all? { |c| WORDLE_SQUARES.include?(c) } }
    raise InputError, "#{name}: a grid row is not five Wordle squares: #{bad}" if bad

    expected = won ? guesses : 6
    if rows.size != expected
      raise InputError, "#{name}: the first line says #{block[:result]}/6 but the grid has #{rows.size} rows"
    end

    solved_at = rows.index { |r| r.each_char.all? { |c| WORDLE_HITS.include?(c) } }
    if won ? solved_at != guesses - 1 : !solved_at.nil?
      raise InputError, "#{name}: the grid does not end the way #{block[:result]}/6 says"
    end
  end
  ['wordle', { 'puzzle' => block[:puzzle], 'won' => won, 'guesses' => guesses, 'hard' => block[:hard] }]
end

def connections_result(block)
  raise InputError, 'Connections: no "Puzzle #" line after the title.' unless block[:puzzle]

  name = label('connections', block[:puzzle])
  rows = block[:rows]
  raise InputError, "#{name}: no grid of coloured squares." if rows.empty?

  bad = rows.find { |r| r.length != 4 || !r.each_char.all? { |c| CONNECTIONS_SQUARES.include?(c) } }
  raise InputError, "#{name}: a grid row is not four Connections squares: #{bad}" if bad

  solved = rows.select { |r| r.each_char.uniq.size == 1 }
  mistakes = rows.size - solved.size
  colours = solved.map { |r| r[0] }
  last_solved = rows.last.each_char.uniq.size == 1
  finished = colours.uniq.size == colours.size &&
             ((solved.size == 4 && mistakes <= 3 && last_solved) ||
              (mistakes == 4 && solved.size <= 3 && !last_solved))
  unless finished
    raise InputError, "#{name}: #{solved.size} solved and #{mistakes} wrong is not a finished game"
  end

  ['connections', { 'puzzle' => block[:puzzle], 'won' => solved.size == 4, 'mistakes' => mistakes }]
end

def describe(game, result)
  if game == 'wordle'
    text = result['won'] ? "#{result['guesses']}/6" : 'X/6'
    result['hard'] ? "#{text}, hard mode" : text
  elsif result['won']
    result['mistakes'].zero? ? 'solved, no mistakes' : "solved, #{result['mistakes']} mistake#{'s' if result['mistakes'] > 1}"
  else
    'not solved'
  end
end

# --- Data file --------------------------------------------------------------

def load_data(path)
  data = File.exist?(path) ? YAML.safe_load(File.read(path, encoding: 'UTF-8')) : nil
  data = {} unless data.is_a?(Hash)
  GAMES.to_h do |game|
    entry = data[game].is_a?(Hash) ? data[game] : {}
    [game, { 'baseline' => entry['baseline'], 'results' => entry['results'] || [], 'summary' => entry['summary'] }]
  end
end

def count?(value)
  value.is_a?(Integer) && value >= 0
end

def counts?(value, size)
  value.is_a?(Array) && value.size == size && value.all? { |v| count?(v) }
end

# Raises on anything the summary could not be trusted to count.
def validate(data)
  GAMES.each do |game|
    entry = data[game]
    results = entry['results']
    raise InputError, "#{game}.results must be a list" unless results.is_a?(Array)

    results.each do |r|
      where = "#{game}.results #{r.inspect}"
      raise InputError, "#{where}: expected exactly #{RESULT_KEYS[game].join(', ')}" unless r.is_a?(Hash) && r.keys.sort == RESULT_KEYS[game].sort
      raise InputError, "#{where}: bad puzzle number" unless count?(r['puzzle'])

      iso_date(r['date'], "#{where}: date")
      raise InputError, "#{where}: won must be true or false" unless [true, false].include?(r['won'])

      if game == 'wordle'
        ok = r['won'] ? r['guesses'].is_a?(Integer) && r['guesses'].between?(1, 6) : r['guesses'].nil?
        raise InputError, "#{where}: guesses must be 1 to 6 for a win and null for a loss" unless ok
        raise InputError, "#{where}: hard must be true or false" unless [true, false].include?(r['hard'])
      else
        ok = r['mistakes'].is_a?(Integer) && (r['won'] ? r['mistakes'].between?(0, 3) : r['mistakes'] == 4)
        raise InputError, "#{where}: mistakes must be 0 to 3 for a win and 4 for a loss" unless ok
      end
    end
    numbers = results.map { |r| r['puzzle'] }
    raise InputError, "#{game}.results: a puzzle appears twice" unless numbers.uniq.size == numbers.size

    base = entry['baseline']
    next if base.nil?

    where = "#{game}.baseline"
    raise InputError, "#{where}: expected exactly #{BASELINE_KEYS[game].join(', ')}" unless base.is_a?(Hash) && base.keys.sort == BASELINE_KEYS[game].sort

    iso_date(base['date'], "#{where}: date")
    %w[puzzle played won current_streak max_streak].each do |k|
      raise InputError, "#{where}: #{k} must be a whole number" unless count?(base[k])
    end
    unless base['won'] <= base['played'] && base['current_streak'] <= base['max_streak'] && base['max_streak'] <= base['won']
      raise InputError, "#{where}: needs won <= played and current streak <= max streak <= won"
    end
    if game == 'wordle'
      raise InputError, "#{where}: distribution must be six counts" unless counts?(base['distribution'], 6)
      raise InputError, "#{where}: the distribution must add up to won" unless base['distribution'].sum == base['won']
    else
      raise InputError, "#{where}: perfect must be a count or null" unless base['perfect'].nil? || count?(base['perfect'])
      hist = base['mistakes']
      unless hist.nil? || (counts?(hist, 5) && hist.sum == base['played'] && hist[0, 4].sum == base['won'] && hist[0] == base['perfect'])
        raise InputError, "#{where}: mistakes must be null or five counts (0 to 4) adding up to played, with 0 to 3 adding up to won and 0 equal to perfect"
      end
    end
  end
end

def summarise(game, entry)
  base = entry['baseline']
  from = base && base['puzzle']
  counted = entry['results'].select { |r| from.nil? || r['puzzle'] > from }.sort_by { |r| r['puzzle'] }
  return nil if base.nil? && counted.empty?

  played = (base ? base['played'] : 0) + counted.size
  won = (base ? base['won'] : 0) + counted.count { |r| r['won'] }

  # The baseline's current streak carries on into the first result only when
  # that result is the next puzzle.
  run = base ? base['current_streak'] : 0
  best = base ? base['max_streak'] : 0
  previous = from
  counted.each do |r|
    run = 0 unless previous && r['puzzle'] == previous + 1
    run = r['won'] ? run + 1 : 0
    best = [best, run].max
    previous = r['puzzle']
  end

  latest = counted.last
  summary = {
    'as_of' => [base && base['date'], latest && latest['date']].compact.max,
    'last_puzzle' => latest ? latest['puzzle'] : from,
    'played' => played,
    'won' => won,
    'win_pct' => played.zero? ? 0 : (100.0 * won / played).round,
    'current_streak' => run,
    'max_streak' => best
  }

  if game == 'wordle'
    dist = base ? base['distribution'].dup : [0] * 6
    counted.each { |r| dist[r['guesses'] - 1] += 1 if r['won'] }
    total = dist.each_with_index.sum { |c, i| c * (i + 1) }
    summary['mean_guesses'] = won.zero? ? nil : (total.to_f / won).round(1)
    summary['distribution'] = dist
  else
    perfect = base ? base['perfect'] : 0
    perfect += counted.count { |r| r['mistakes'].zero? } unless perfect.nil?
    hist = base ? base['mistakes'] : [0] * 5
    mean = nil
    unless hist.nil? || played.zero?
      hist = hist.dup
      counted.each { |r| hist[r['mistakes']] += 1 }
      mean = (hist.each_with_index.sum { |c, i| c * i }.to_f / played).round(1)
    end
    summary['perfect'] = perfect
    summary['mean_mistakes'] = mean
    summary['mistakes'] = hist
  end
  summary
end

def recompute(data)
  GAMES.each do |game|
    data[game]['results'] = data[game]['results'].sort_by { |r| r['puzzle'] }
    data[game]['summary'] = summarise(game, data[game])
  end
  data
end

def scalar(value)
  case value
  when nil then 'null'
  when true, false, Integer, Float then value.to_s
  when String
    raise ArgumentError, "unexpected string #{value.inspect}" unless value.match?(/\A\d{4}-\d{2}-\d{2}\z/)

    %("#{value}")
  when Array then "[#{value.map { |v| scalar(v) }.join(', ')}]"
  else raise ArgumentError, "unexpected value #{value.inspect}"
  end
end

def block(hash, keys)
  return " null\n" if hash.nil?

  "\n" + keys.map { |k| "    #{k}: #{scalar(hash[k])}\n" }.join
end

# One line per result, so a log is one added line in a diff.
def emit(data)
  out = +HEADER
  GAMES.each do |game|
    entry = data[game]
    out << "\n#{game}:\n"
    out << '  baseline:' << block(entry['baseline'], BASELINE_KEYS[game])
    out << '  results:'
    if entry['results'].empty?
      out << " []\n"
    else
      out << "\n"
      entry['results'].each do |r|
        out << '    - {' << RESULT_KEYS[game].map { |k| "#{k}: #{scalar(r[k])}" }.join(', ') << "}\n"
      end
    end
    out << '  summary:' << block(entry['summary'], SUMMARY_KEYS[game])
  end
  out
end

def save(data, path)
  validate(data)
  text = emit(data)
  raise 'The written YAML does not read back as the same data.' unless YAML.safe_load(text) == data

  File.write(path, text, encoding: 'UTF-8')
end

def report(data)
  GAMES.each do |game|
    s = data[game]['summary']
    title = game.capitalize
    if s.nil?
      puts "#{title}: no results yet."
      next
    end
    line = "#{title}: #{s['played']} played, #{s['win_pct']}% won, current streak #{s['current_streak']}, longest #{s['max_streak']}"
    line += ", #{s['mean_guesses']} guesses on average" if s['mean_guesses']
    line += ", #{s['perfect']} perfect" if game == 'connections' && s['perfect']
    line += ", #{s['mean_mistakes']} mistakes on average" if s['mean_mistakes']
    puts "#{line}; as of #{s['as_of']} (#{label(game, s['last_puzzle'])})."
  end
end

# --- Commands ---------------------------------------------------------------

def read_input
  text = if $stdin.tty?
           begin
             IO.popen({ 'LANG' => 'en_US.UTF-8' }, ['pbpaste'], &:read)
           rescue SystemCallError
             raise InputError, 'No input: pipe the share text in, or run this on macOS with it on the clipboard.'
           end
         else
           $stdin.read
         end
  text.to_s.dup.force_encoding(Encoding::UTF_8)
end

def cmd_log(args, path)
  date = nil
  OptionParser.new do |o|
    o.on('--date DATE') { |v| date = iso_date(v, '--date') }
  end.parse!(args)
  raise InputError, "log takes no arguments; unexpected #{args.join(' ')}" unless args.empty?
  raise InputError, '--date is after today.' if date && date > Date.today + 1

  results = parse_share(read_input)
  raise InputError, '--date applies to one result at a time.' if date && results.size > 1

  data = load_data(path)
  results.each do |game, result|
    on = date || puzzle_date(game, result['puzzle'])
    if date.nil? && on > Date.today + 1
      raise InputError, "#{label(game, result['puzzle'])} would be dated #{on}, after today; check the number or pass --date."
    end

    result['date'] = on.iso8601
    list = data[game]['results']
    replaced = list.reject! { |r| r['puzzle'] == result['puzzle'] }
    list << RESULT_KEYS[game].to_h { |k| [k, result[k]] }
    base = data[game]['baseline']
    note = base && result['puzzle'] <= base['puzzle'] ? ' Already counted in the baseline, so not added again.' : ''
    puts "#{replaced ? 'Replaced' : 'Logged'} #{label(game, result['puzzle'])} (#{on}): #{describe(game, result)}.#{note}"
  end
  save(recompute(data), path)
  report(data)
end

def counts_option(text, what)
  values = text.split(',').map(&:strip)
  raise InputError, "#{what} takes comma-separated whole numbers" unless values.all? { |v| v.match?(/\A\d+\z/) }

  values.map(&:to_i)
end

def cmd_baseline(args, path)
  game = args.shift
  raise InputError, 'baseline needs a game: wordle or connections' unless GAMES.include?(game)

  opt = {}
  OptionParser.new do |o|
    o.on('--date DATE') { |v| opt[:date] = iso_date(v, '--date') }
    o.on('--puzzle N', Integer) { |v| opt[:puzzle] = v }
    o.on('--played N', Integer) { |v| opt[:played] = v }
    o.on('--win-pct N', Integer) { |v| opt[:win_pct] = v }
    o.on('--current N', Integer) { |v| opt[:current] = v }
    o.on('--max N', Integer) { |v| opt[:max] = v }
    o.on('--distribution LIST') { |v| opt[:distribution] = counts_option(v, '--distribution') }
    o.on('--perfect N', Integer) { |v| opt[:perfect] = v }
    o.on('--mistakes LIST') { |v| opt[:mistakes] = counts_option(v, '--mistakes') }
  end.parse!(args)
  raise InputError, "unexpected #{args.join(' ')}" unless args.empty?

  missing = %i[date played current max].reject { |k| opt.key?(k) }
  missing << :distribution if game == 'wordle' && !opt.key?(:distribution)
  missing << :win_pct if game == 'connections' && !opt.key?(:mistakes) && !opt.key?(:win_pct)
  raise InputError, "baseline #{game} needs #{missing.map { |k| "--#{k.to_s.tr('_', '-')}" }.join(', ')}" unless missing.empty?
  raise InputError, '--date is after today.' if opt[:date] > Date.today + 1

  played = opt[:played]
  puzzle = opt[:puzzle] || puzzle_on(game, opt[:date])
  base = { 'date' => opt[:date].iso8601, 'puzzle' => puzzle, 'played' => played }

  if game == 'wordle'
    dist = opt[:distribution]
    raise InputError, '--distribution takes six counts, for 1 to 6 guesses' unless dist.size == 6

    won = dist.sum
    raise InputError, "the distribution adds up to #{won} wins, more than #{played} played" if won > played
    if opt[:win_pct] && played.positive? && (100.0 * won / played).round != opt[:win_pct]
      raise InputError, "the distribution adds up to #{won} wins, #{(100.0 * won / played).round}% of #{played}, not #{opt[:win_pct]}%"
    end

    base.merge!('won' => won, 'distribution' => dist)
  elsif opt[:mistakes]
    hist = opt[:mistakes]
    raise InputError, '--mistakes takes four counts (0 to 3 mistakes) or five (0 to 4)' unless [4, 5].include?(hist.size)

    hist += [played - hist.sum] if hist.size == 4
    raise InputError, "--mistakes adds up to #{hist.sum}, but #{played} were played" if hist.sum != played || hist.last.negative?

    won = hist[0, 4].sum
    if opt[:win_pct] && played.positive? && (100.0 * won / played).round != opt[:win_pct]
      raise InputError, "--mistakes gives #{won} wins, #{(100.0 * won / played).round}% of #{played}, not #{opt[:win_pct]}%"
    end
    raise InputError, "--perfect is #{opt[:perfect]} but the mistake chart starts at #{hist[0]}" if opt[:perfect] && opt[:perfect] != hist[0]

    base.merge!('won' => won, 'perfect' => hist[0], 'mistakes' => hist)
  else
    candidates = (0..played).select { |w| played.positive? && (100.0 * w / played).round == opt[:win_pct] }
    raise InputError, "no number of wins out of #{played} rounds to #{opt[:win_pct]}%" if candidates.empty?

    won = (played * opt[:win_pct] / 100.0).round
    won = candidates.min_by { |w| (w - played * opt[:win_pct] / 100.0).abs } unless candidates.include?(won)
    if candidates.size > 1
      warn "Note: #{opt[:win_pct]}% of #{played} is anywhere from #{candidates.min} to #{candidates.max} wins; " \
           "using #{won}. --mistakes gives the exact count."
    end
    base.merge!('won' => won, 'perfect' => opt[:perfect], 'mistakes' => nil)
  end
  base.merge!('current_streak' => opt[:current], 'max_streak' => opt[:max])

  data = load_data(path)
  data[game]['baseline'] = BASELINE_KEYS[game].to_h { |k| [k, base[k]] }
  validate(data)
  covered = data[game]['results'].count { |r| r['puzzle'] <= puzzle }
  save(recompute(data), path)
  puts "Baseline for #{game.capitalize} set from the statistics read on #{base['date']}, up to #{label(game, puzzle)}."
  if covered.positive?
    puts "#{covered == 1 ? '1 logged result' : "#{covered} logged results"} up to that puzzle stay in the file but are not counted again."
  end
  report(data)
end

def cmd_drop(args, path)
  game, number = args
  raise InputError, 'drop needs a game and a puzzle number, for example: drop wordle 1598' unless GAMES.include?(game) && number.to_s.match?(/\A[\d,.]+\z/)

  puzzle = digits(number)
  data = load_data(path)
  removed = data[game]['results'].reject! { |r| r['puzzle'] == puzzle }
  raise InputError, "#{label(game, puzzle)} is not in the log." unless removed

  puts "Removed #{label(game, puzzle)}."
  save(recompute(data), path)
  report(data)
end

def cmd_check(args, path)
  fix = args.delete('--fix')
  raise InputError, "unexpected #{args.join(' ')}" unless args.empty?
  raise InputError, "#{path} not found." unless File.exist?(path)

  data = load_data(path)
  validate(data)
  stale = GAMES.reject { |game| summarise(game, data[game]) == data[game]['summary'] }
  if stale.empty?
    counts = GAMES.map { |game| "#{data[game]['results'].size} #{game.capitalize}" }.join(', ')
    puts "NYT Games summary matches its data (#{counts} results logged)."
    return
  end
  if fix
    save(recompute(data), path)
    puts "Rewrote the summary for #{stale.join(' and ')}."
    report(data)
    return
  end
  stale.each do |game|
    warn "#{game}: stored summary #{data[game]['summary'].inspect}"
    warn "#{game}: recomputed    #{summarise(game, data[game]).inspect}"
  end
  warn 'The summary does not match the results. Run: ruby script/nyt-games.rb check --fix'
  exit 1
end

def main(argv)
  args = argv.dup
  path = DEFAULT_FILE
  if (i = args.index('--file'))
    path = File.expand_path(args[i + 1].to_s)
    args.slice!(i, 2)
  end
  command = args.shift

  case command
  when 'log' then cmd_log(args, path)
  when 'baseline' then cmd_baseline(args, path)
  when 'drop' then cmd_drop(args, path)
  when 'check' then cmd_check(args, path)
  else
    warn 'Usage: ruby script/nyt-games.rb log | baseline GAME OPTIONS | drop GAME PUZZLE | check [--fix]'
    warn 'The header of this file explains each one.'
    exit 2
  end
rescue InputError, OptionParser::ParseError => e
  warn "Error: #{e.message}"
  exit 1
end

main(ARGV) if $PROGRAM_NAME == __FILE__
