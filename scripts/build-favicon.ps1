Add-Type -AssemblyName System.Drawing

$root = Get-Location
$public = Join-Path $root "public"
$source = Join-Path $public "icon-512.png"
$dest = Join-Path $public "favicon.ico"

if (-not (Test-Path $source)) {
  throw "Missing source icon: $source"
}

$sizes = @(256, 128, 64, 32, 16)

function New-ScaledPngBytes {
  param(
    [string]$sourcePath,
    [int]$size
  )
  $src = [System.Drawing.Bitmap]::FromFile($sourcePath)
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($src, 0, 0, $size, $size)
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $bytes = $ms.ToArray()
  $ms.Dispose()
  $g.Dispose()
  $bmp.Dispose()
  $src.Dispose()
  return $bytes
}

$images = @()
foreach ($size in $sizes) {
  $bytes = New-ScaledPngBytes -sourcePath $source -size $size
  $images += [PSCustomObject]@{ Size = $size; Bytes = $bytes }
}

$fs = [System.IO.File]::Create($dest)
$bw = New-Object System.IO.BinaryWriter($fs)

# ICONDIR
$bw.Write([UInt16]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]$images.Count)

$offset = 6 + (16 * $images.Count)

foreach ($img in $images) {
  $size = $img.Size
  $width = if ($size -ge 256) { 0 } else { $size }
  $height = if ($size -ge 256) { 0 } else { $size }
  $bw.Write([Byte]$width)
  $bw.Write([Byte]$height)
  $bw.Write([Byte]0)
  $bw.Write([Byte]0)
  $bw.Write([UInt16]1)
  $bw.Write([UInt16]32)
  $bw.Write([UInt32]$img.Bytes.Length)
  $bw.Write([UInt32]$offset)
  $offset += $img.Bytes.Length
}

foreach ($img in $images) {
  $bw.Write($img.Bytes, 0, $img.Bytes.Length)
}

$bw.Flush()
$bw.Close()
$fs.Close()

Write-Host "Generated: $dest"
