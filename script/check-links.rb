# Every internal link in the built site must resolve to something in the build.
#
# Run it against _site after a build. It only follows links that stay on this
# site: external URLs, fragments, and the entity-encoded contact address are
# skipped, since none of them can be verified from the filesystem.
#
#   bundle exec jekyll build && ruby script/check-links.rb

ROOT = '_site'.freeze
abort "#{ROOT} not found. Build the site first." unless Dir.exist?(ROOT)

pages = Dir["#{ROOT}/**/*.html"].sort
abort "No HTML in #{ROOT}." if pages.empty?

def resolve(target, page)
  path = target.split('#').first.to_s.split('?').first.to_s
  return nil if path.empty?

  base = if path.start_with?('/')
           File.join(ROOT, path)
         else
           File.join(File.dirname(page), path)
         end
  base = File.expand_path(base)
  candidates = [base]
  if File.extname(base).empty?
    # A directory URL is served by its index; a bare name may be a page.
    candidates << File.join(base, 'index.html')
    candidates << "#{base}.html"
  end
  candidates.uniq
end

broken = []
checked = 0

pages.each do |page|
  html = File.read(page)
  html.scan(/(?:href|src)="([^"]+)"/).flatten.each do |target|
    next if target.start_with?('http://', 'https://', '//', '#', 'data:', 'mailto:')
    next if target.start_with?('&#') # entity-encoded mailto
    next if target.strip.empty?

    candidates = resolve(target, page)
    next if candidates.nil?

    checked += 1
    next if candidates.any? { |c| File.file?(c) }

    broken << [page.sub("#{ROOT}/", ''), target]
  end

  html.scan(/srcset="([^"]+)"/).flatten.each do |set|
    set.split(',').each do |entry|
      target = entry.strip.split(/\s+/).first.to_s
      next if target.empty? || target.start_with?('http', 'data:')

      checked += 1
      candidates = resolve(target, page)
      next if candidates && candidates.any? { |c| File.file?(c) }

      broken << [page.sub("#{ROOT}/", ''), target]
    end
  end
end

puts "#{checked} internal references across #{pages.size} pages"

if broken.empty?
  puts 'Broken links: none'
  exit 0
end

warn "Broken links (#{broken.size}):"
broken.each { |page, target| warn "  #{page} -> #{target}" }
exit 1
