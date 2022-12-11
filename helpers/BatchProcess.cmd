rem NOTE: REQUIRES IMAGEMAGICK: https://imagemagick.org

mkdir thumb
magick *.png -set filename:f "%%t" -resize 853x480! -interlace JPEG "thumb/%%[filename:f].jpg"