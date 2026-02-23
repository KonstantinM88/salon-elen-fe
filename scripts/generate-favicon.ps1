$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing
Add-Type -Name NativeMethods -Namespace Win32 -MemberDefinition @'
[DllImport("user32.dll", CharSet = CharSet.Auto)]
public static extern bool DestroyIcon(IntPtr handle);
'@

$size = 256
$bmp = New-Object System.Drawing.Bitmap -ArgumentList $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::Transparent)

$outerCircle = New-Object System.Drawing.Rectangle 12, 12, 232, 232
$mainCircle = New-Object System.Drawing.Rectangle 20, 20, 216, 216

$bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$bgPath.AddEllipse($mainCircle)
$bgBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($bgPath)
$bgBrush.CenterPoint = New-Object System.Drawing.PointF(128, 92)
$bgBrush.CenterColor = [System.Drawing.Color]::FromArgb(255, 255, 253, 249)
$bgBrush.SurroundColors = [System.Drawing.Color[]]@([System.Drawing.Color]::FromArgb(255, 234, 220, 196))
$g.FillEllipse($bgBrush, $mainCircle)

$outerRingBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $outerCircle,
  [System.Drawing.Color]::FromArgb(255, 255, 242, 207),
  [System.Drawing.Color]::FromArgb(255, 185, 125, 62),
  35
)
$outerRingPen = New-Object System.Drawing.Pen($outerRingBrush, 10)
$g.DrawEllipse($outerRingPen, $outerCircle)

$innerRingBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $mainCircle,
  [System.Drawing.Color]::FromArgb(255, 255, 251, 241),
  [System.Drawing.Color]::FromArgb(255, 244, 226, 193),
  90
)
$innerRingPen = New-Object System.Drawing.Pen($innerRingBrush, 3.5)
$g.DrawEllipse($innerRingPen, 32, 32, 192, 192)

$glowBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle 38, 32, 180, 84),
  [System.Drawing.Color]::FromArgb(110, 255, 255, 255),
  [System.Drawing.Color]::FromArgb(0, 255, 255, 255),
  90
)
$g.FillEllipse($glowBrush, 42, 36, 172, 78)

$font = New-Object System.Drawing.Font("Georgia", 104, ([System.Drawing.FontStyle]::Bold -bor [System.Drawing.FontStyle]::Italic), [System.Drawing.GraphicsUnit]::Pixel)
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$fmt.LineAlignment = [System.Drawing.StringAlignment]::Center

$txtBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Rectangle 0, 22, 256, 214),
  [System.Drawing.Color]::FromArgb(255, 255, 242, 205),
  [System.Drawing.Color]::FromArgb(255, 195, 132, 67),
  74
)

$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 94, 68, 37))
$g.DrawString("SE", $font, $shadowBrush, (New-Object System.Drawing.RectangleF(2, 24, 256, 206)), $fmt)
$g.DrawString("SE", $font, $txtBrush, (New-Object System.Drawing.RectangleF(0, 20, 256, 206)), $fmt)

$spark = [System.Drawing.PointF[]]@(
  (New-Object System.Drawing.PointF(192, 84)),
  (New-Object System.Drawing.PointF(199, 99)),
  (New-Object System.Drawing.PointF(214, 106)),
  (New-Object System.Drawing.PointF(199, 113)),
  (New-Object System.Drawing.PointF(192, 128)),
  (New-Object System.Drawing.PointF(185, 113)),
  (New-Object System.Drawing.PointF(170, 106)),
  (New-Object System.Drawing.PointF(185, 99))
)
$sparkBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 237, 186, 105))
$g.FillPolygon($sparkBrush, $spark)

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$iconPath = Join-Path $PSScriptRoot "..\src\app\favicon.ico"
$iconPath = [System.IO.Path]::GetFullPath($iconPath)
$stream = [System.IO.File]::Open($iconPath, [System.IO.FileMode]::Create)
$icon.Save($stream)
$stream.Close()

$icon.Dispose()
[Win32.NativeMethods]::DestroyIcon($hIcon) | Out-Null

$sparkBrush.Dispose()
$shadowBrush.Dispose()
$txtBrush.Dispose()
$font.Dispose()
$glowBrush.Dispose()
$innerRingPen.Dispose()
$innerRingBrush.Dispose()
$outerRingPen.Dispose()
$outerRingBrush.Dispose()
$bgBrush.Dispose()
$bgPath.Dispose()
$g.Dispose()
$bmp.Dispose()

Write-Output "Generated: $iconPath"
