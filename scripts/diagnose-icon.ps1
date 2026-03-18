Add-Type -AssemblyName System.Drawing

$source = "public/icon-512.png"
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

foreach ($size in $sizes) {
  $bytes = New-ScaledPngBytes -sourcePath $source -size $size
  Write-Output "$size => $($bytes.Length) bytes"
}
