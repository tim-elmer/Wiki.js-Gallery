$_ip = $InformationPreference
$InformationPreference = 'Continue'
if ((Get-Item -Path $args[0]) -isnot [System.IO.DirectoryInfo]) {
    throw 'Directory required'
}

Set-Location -Path $args[0]

if (-not (Test-Path -Path 'web')){
    New-Item -Name 'web' -ItemType 'Directory' > $null
}
if (-not (Test-Path -Path 'web/thumb')) {
    New-Item -Path 'web' -Name 'thumb' -ItemType 'Directory' > $null
}

Get-ChildItem -Path './*' -File -Include @('*.png', '*.jpg', '*.bmp', '*.jpeg') | ForEach-Object -Process {
    Write-Information "Processing $($_.Name)"
    magick $_.FullName -resize 1920x1080> -interlace JPEG -compress JPEG "web/$($_.BaseName).jpg"
    magick $_.FullName -resize 853x480> -interlace JPEG -compress JPEG "web/thumb/$($_.BaseName).jpg"
}
Write-Information 'Done'
$InformationPreference = $_ip