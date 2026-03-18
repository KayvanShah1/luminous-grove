Add-Type -AssemblyName System.Drawing

$root = Get-Location
$public = Join-Path $root "public"

function New-RoundedRectPath {
  param(
    [int]$x,
    [int]$y,
    [int]$width,
    [int]$height,
    [int]$radius
  )
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $arc = New-Object System.Drawing.Rectangle($x, $y, $diameter, $diameter)
  $path.AddArc($arc, 180, 90)
  $arc.X = $x + $width - $diameter
  $path.AddArc($arc, 270, 90)
  $arc.Y = $y + $height - $diameter
  $path.AddArc($arc, 0, 90)
  $arc.X = $x
  $path.AddArc($arc, 90, 90)
  $path.CloseFigure()
  return $path
}

function Save-OgImage {
  param([string]$path)
  $width = 1200
  $height = 630
  $bmp = New-Object System.Drawing.Bitmap($width, $height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0,0)),
    (New-Object System.Drawing.Point($width, $height)),
    [System.Drawing.Color]::FromArgb(255, 7, 16, 24),
    [System.Drawing.Color]::FromArgb(255, 12, 18, 22)
  )
  $g.FillRectangle($bgBrush, 0, 0, $width, $height)

  $glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $glowPath.AddEllipse(720, 80, 520, 520)
  $glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
  $glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(110, 125, 242, 193)
  $glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 11, 16, 21))
  $g.FillPath($glowBrush, $glowPath)

  $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 45, 224, 179), 1)
  $g.DrawCurve($linePen, @(
    (New-Object System.Drawing.Point(0, 520)),
    (New-Object System.Drawing.Point(160, 500)),
    (New-Object System.Drawing.Point(320, 485)),
    (New-Object System.Drawing.Point(420, 470))
  ))
  $g.DrawCurve($linePen, @(
    (New-Object System.Drawing.Point(1200, 430)),
    (New-Object System.Drawing.Point(980, 420)),
    (New-Object System.Drawing.Point(860, 400)),
    (New-Object System.Drawing.Point(720, 360))
  ))
  $g.DrawCurve($linePen, @(
    (New-Object System.Drawing.Point(40, 120)),
    (New-Object System.Drawing.Point(200, 140)),
    (New-Object System.Drawing.Point(300, 160)),
    (New-Object System.Drawing.Point(420, 200))
  ))

  $trunkBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 260)),
    (New-Object System.Drawing.Point(0, 560)),
    [System.Drawing.Color]::FromArgb(255, 166, 247, 215),
    [System.Drawing.Color]::FromArgb(255, 46, 230, 176)
  )
  $trunkPen = New-Object System.Drawing.Pen($trunkBrush, 10)
  $trunkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $trunkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawBezier($trunkPen, 600, 560, 600, 510, 596, 470, 590, 430)
  $g.DrawBezier($trunkPen, 590, 430, 584, 390, 574, 340, 560, 300)

  $branchPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 110, 245, 202), 6)
  $branchPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $branchPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawBezier($branchPen, 560, 300, 540, 260, 510, 230, 470, 210)
  $g.DrawBezier($branchPen, 560, 300, 590, 260, 630, 235, 680, 220)

  $subPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 73, 230, 190), 4)
  $subPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $subPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawBezier($subPen, 470, 210, 430, 190, 390, 165, 360, 135)
  $g.DrawBezier($subPen, 680, 220, 720, 205, 760, 180, 820, 150)
  $g.DrawBezier($subPen, 540, 360, 510, 340, 470, 320, 420, 310)
  $g.DrawBezier($subPen, 590, 360, 630, 340, 690, 320, 750, 310)

  $nodeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 143, 248, 215))
  $nodes = @(
    @{x=360;y=135;r=5},
    @{x=420;y=310;r=4},
    @{x=470;y=210;r=4},
    @{x=720;y=165;r=5},
    @{x=760;y=310;r=4},
    @{x=820;y=150;r=5}
  )
  foreach ($n in $nodes) {
    $g.FillEllipse($nodeBrush, $n.x - $n.r, $n.y - $n.r, $n.r * 2, $n.r * 2)
  }

  $titleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 44, [System.Drawing.FontStyle]::Regular)
  $subtitleFont = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Regular)
  $taglineFont = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)
  $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 230, 255, 244))
  $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 185, 243, 221))
  $tagBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 143, 231, 199))

  $g.DrawString("Neuromorph Tree", $titleFont, $titleBrush, 90, 150)
  $g.DrawString("Living Architecture of Light", $subtitleFont, $subBrush, 90, 215)
  $g.DrawString("Interactive generative bioluminescent forest", $taglineFont, $tagBrush, 90, 500)

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

  $tagBrush.Dispose()
  $subBrush.Dispose()
  $titleBrush.Dispose()
  $taglineFont.Dispose()
  $subtitleFont.Dispose()
  $titleFont.Dispose()
  $nodeBrush.Dispose()
  $subPen.Dispose()
  $branchPen.Dispose()
  $trunkPen.Dispose()
  $trunkBrush.Dispose()
  $linePen.Dispose()
  $glowBrush.Dispose()
  $glowPath.Dispose()
  $bgBrush.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

function Save-Icon {
  param([string]$path)
  $size = 512
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

  $rectPath = New-RoundedRectPath -x 0 -y 0 -width $size -height $size -radius 96
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0,0)),
    (New-Object System.Drawing.Point($size, $size)),
    [System.Drawing.Color]::FromArgb(255, 8, 19, 27),
    [System.Drawing.Color]::FromArgb(255, 11, 15, 19)
  )
  $g.FillPath($bgBrush, $rectPath)

  $trunkBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 180)),
    (New-Object System.Drawing.Point(0, 400)),
    [System.Drawing.Color]::FromArgb(255, 183, 255, 226),
    [System.Drawing.Color]::FromArgb(255, 44, 230, 176)
  )
  $trunkPen = New-Object System.Drawing.Pen($trunkBrush, 16)
  $trunkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $trunkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawBezier($trunkPen, 256, 400, 256, 360, 252, 325, 246, 295)
  $g.DrawBezier($trunkPen, 246, 295, 240, 260, 232, 225, 220, 200)

  $branchPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 110, 245, 202), 10)
  $branchPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $branchPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawBezier($branchPen, 220, 200, 200, 175, 170, 155, 140, 140)
  $g.DrawBezier($branchPen, 220, 200, 245, 175, 275, 155, 315, 140)

  $subPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 91, 240, 198), 8)
  $subPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $subPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawBezier($subPen, 246, 270, 220, 250, 190, 235, 160, 230)
  $g.DrawBezier($subPen, 262, 270, 288, 250, 322, 235, 356, 230)

  $nodeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 143, 248, 215))
  $g.FillEllipse($nodeBrush, 140 - 8, 140 - 8, 16, 16)
  $g.FillEllipse($nodeBrush, 160 - 6, 230 - 6, 12, 12)
  $g.FillEllipse($nodeBrush, 315 - 8, 140 - 8, 16, 16)
  $g.FillEllipse($nodeBrush, 356 - 6, 230 - 6, 12, 12)

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

  $nodeBrush.Dispose()
  $subPen.Dispose()
  $branchPen.Dispose()
  $trunkPen.Dispose()
  $trunkBrush.Dispose()
  $bgBrush.Dispose()
  $rectPath.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

function Save-ScaledIcon {
  param(
    [string]$sourcePath,
    [string]$destPath,
    [int]$size
  )
  $src = [System.Drawing.Bitmap]::FromFile($sourcePath)
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($src, 0, 0, $size, $size)
  $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
  $src.Dispose()
}

$ogPath = Join-Path $public "og-image.png"
$iconPath = Join-Path $public "icon-512.png"
$applePath = Join-Path $public "apple-touch-icon.png"
$favicon32 = Join-Path $public "favicon-32x32.png"
$favicon16 = Join-Path $public "favicon-16x16.png"

Save-OgImage -path $ogPath
Save-Icon -path $iconPath
Save-ScaledIcon -sourcePath $iconPath -destPath $applePath -size 180
Save-ScaledIcon -sourcePath $iconPath -destPath $favicon32 -size 32
Save-ScaledIcon -sourcePath $iconPath -destPath $favicon16 -size 16

Write-Host "Generated:" $ogPath
Write-Host "Generated:" $iconPath
Write-Host "Generated:" $applePath
Write-Host "Generated:" $favicon32
Write-Host "Generated:" $favicon16
