# No image in the repository may carry embedded metadata.
#
# A photo straight off a phone carries GPS coordinates, a device model and a
# timestamp. Publishing one publishes all three. This reads the container formats
# directly rather than depending on a tool being installed, so it runs the same
# on a laptop and in CI.
#
#   ruby script/check-exif.rb

JPEG_SEGMENTS = {
  0xE1 => 'APP1 (Exif/XMP)',
  0xED => 'APP13 (IPTC)',
  0xEE => 'APP14 (Adobe)',
  0xFE => 'COM (comment)'
}.freeze

PNG_CHUNKS = %w[eXIf tEXt iTXt zTXt].freeze
WEBP_CHUNKS = %w[EXIF XMP].freeze

def jpeg_metadata(bytes)
  found = []
  i = 2 # past SOI
  while i < bytes.bytesize - 1
    break unless bytes.getbyte(i) == 0xFF

    marker = bytes.getbyte(i + 1)
    break if marker == 0xDA || marker == 0xD9 # start of scan / end of image

    length = bytes[i + 2, 2].unpack1('n').to_i
    found << JPEG_SEGMENTS[marker] if JPEG_SEGMENTS.key?(marker)
    i += 2 + length
  end
  found
end

def png_metadata(bytes)
  found = []
  i = 8 # past signature
  while i < bytes.bytesize - 8
    length = bytes[i, 4].unpack1('N').to_i
    type = bytes[i + 4, 4]
    break if type == 'IEND'

    found << type if PNG_CHUNKS.include?(type)
    i += 12 + length
  end
  found
end

def webp_metadata(bytes)
  found = []
  i = 12 # past RIFF header
  while i < bytes.bytesize - 8
    type = bytes[i, 4].to_s.strip
    length = bytes[i + 4, 4].unpack1('V').to_i
    found << type if WEBP_CHUNKS.include?(type)
    i += 8 + length + (length.odd? ? 1 : 0)
  end
  found
end

files = Dir['**/*.{jpg,jpeg,png,webp}'].reject { |f| f.start_with?('_site/', '.jekyll-cache/', 'node_modules/') }.sort
abort 'No images found. Run this from the repository root.' if files.empty?

dirty = {}
files.each do |file|
  bytes = File.binread(file)
  found = case File.extname(file).downcase
          when '.jpg', '.jpeg' then jpeg_metadata(bytes)
          when '.png' then png_metadata(bytes)
          when '.webp' then webp_metadata(bytes)
          else []
          end
  dirty[file] = found unless found.empty?
  puts format('  %-12s %s', found.empty? ? 'clean' : 'METADATA', file)
end

if dirty.empty?
  puts "#{files.size} images, none carrying metadata"
  exit 0
end

warn "\nImages carrying metadata:"
dirty.each { |file, found| warn "  #{file}: #{found.join(', ')}" }
warn "\nStrip it before committing. Re-saving through an image library without the"
warn 'original metadata is enough; check the result with this script.'
exit 1
