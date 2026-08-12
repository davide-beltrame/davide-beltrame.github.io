# Every English string in _data must have an Italian counterpart.
#
# A bilingual value is any hash with an `en` or an `it` key. A missing key or an
# empty value fails: templates resolve through _includes/t.html, which falls back
# to English, and a silent fallback is how a page ends up half-translated without
# anyone noticing. A value of "TODO" is reported and tolerated — it marks a known
# gap that renders as English rather than as a placeholder.
#
#   ruby script/check-i18n.rb

require 'yaml'

missing = []
empty   = []
todo    = []
pairs   = 0

walk = lambda do |node, path|
  case node
  when Hash
    if node.key?('en') || node.key?('it')
      pairs += 1
      %w[en it].each do |lang|
        unless node.key?(lang)
          missing << "#{path}.#{lang}"
          next
        end
        value = node[lang]
        if value.nil? || (value.is_a?(String) && value.strip.empty?)
          empty << "#{path}.#{lang}"
        elsif value.is_a?(String) && value.strip == 'TODO'
          todo << "#{path}.#{lang}"
        end
      end
      next
    end
    node.each { |key, value| walk.call(value, "#{path}.#{key}") }
  when Array
    node.each_with_index { |value, i| walk.call(value, "#{path}[#{i}]") }
  end
end

files = Dir['_data/*.yml'].sort
abort 'No _data/*.yml files found. Run this from the repository root.' if files.empty?
files.each { |file| walk.call(YAML.load_file(file), File.basename(file, '.yml')) }

puts "#{pairs} bilingual pairs in #{files.size} files"

{ 'Missing key' => missing, 'Empty value' => empty }.each do |label, rows|
  puts rows.empty? ? "#{label}: none" : "#{label} (#{rows.size}):\n" + rows.map { |r| "  #{r}" }.join("\n")
end
puts todo.empty? ? 'TODO: none' : "TODO, renders as English (#{todo.size}):\n" + todo.map { |r| "  #{r}" }.join("\n")

exit(missing.empty? && empty.empty? ? 0 : 1)
