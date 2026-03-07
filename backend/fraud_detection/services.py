import io
from PIL import Image
from exif import Image as ExifImage
import datetime

class ScreenshotForensics:
    @staticmethod
    def check_metadata(image_bytes):
        """
        Analyzes image metadata for authenticity signals.
        Score: 0-25
        """
        score = 0
        findings = []
        
        try:
            img = ExifImage(image_bytes)
            
            # 1. EXIF Presence (Production device signatures)
            if img.has_exif:
                score += 10
                findings.append("EXIF metadata detected (Good signal)")
                
                # 2. Software Tags (Editing detection)
                software = getattr(img, 'software', '').lower()
                if any(x in software for x in ['photoshop', 'gimp', 'picsart', 'snapseed']):
                    score -= 15
                    findings.append(f"Editing software detected: {software}")
                else:
                    score += 5
                    findings.append("No common editing software tags found")
            else:
                findings.append("No EXIF metadata - Likely a digital screenshot (Normal)")
                score += 5 # Screenshots don't always have EXIF, but aren't necessarily fake

            # 3. GPS Data (Real-world signal)
            if hasattr(img, 'gps_latitude'):
                score += 5
                findings.append("GPS coordinates found (Strong authenticity signal)")
            
            # 4. DateTime Check
            if hasattr(img, 'datetime_original'):
                dt_str = img.datetime_original
                try:
                    dt = datetime.datetime.strptime(dt_str, '%Y:%m:%d %H:%M:%S')
                    if (datetime.datetime.now() - dt).days < 7:
                        score += 5
                        findings.append("Screenshot is recent (Within 7 days)")
                    else:
                        findings.append("Screenshot date is stale (> 7 days)")
                except:
                    pass

        except Exception as e:
            findings.append(f"Metadata read error: {str(e)}")

        return min(max(score, 0), 25), findings

    @staticmethod
    def check_image_integrity(image_bytes):
        """
        Checks for physical consistency of the image.
        """
        score = 0
        findings = []
        
        try:
            img = Image.open(io.BytesIO(image_bytes))
            
            # Resolution check (from doc: Min 720x1280)
            w, h = img.size
            if w >= 720 and h >= 1280:
                score += 5
                findings.append(f"Resolution OK: {w}x{h}")
            else:
                findings.append(f"Low resolution: {w}x{h} (Potential reuse/re-compression)")

            # Format check
            if img.format in ['JPEG', 'PNG']:
                score += 5
                findings.append(f"Format: {img.format} (Valid)")

        except Exception as e:
            findings.append(f"Integrity check error: {str(e)}")

        return score, findings
