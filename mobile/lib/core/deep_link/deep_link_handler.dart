import 'dart:async';
import 'package:app_links/app_links.dart';

class DeepLinkHandler {
  final AppLinks _appLinks = AppLinks();
  StreamSubscription<Uri>? _sub;

  void initDeepLinks({
    required Function(String trackCode) onOpenTrack,
    required Function(String certCode) onVerifyCertificate,
    required Function(String sessionPin) onQuickCheckIn,
  }) {
    _sub = _appLinks.uriLinkStream.listen((uri) {
      _processUri(
        uri,
        onOpenTrack: onOpenTrack,
        onVerifyCertificate: onVerifyCertificate,
        onQuickCheckIn: onQuickCheckIn,
      );
    });
  }

  void _processUri(
    Uri uri, {
    required Function(String trackCode) onOpenTrack,
    required Function(String certCode) onVerifyCertificate,
    required Function(String sessionPin) onQuickCheckIn,
  }) {
    // 1. Universal Links: https://hoctructuyen.tinhocgenz.io.vn/verify/<id>
    if (uri.path.startsWith('/verify/')) {
      final certCode = uri.pathSegments.length > 1 ? uri.pathSegments[1] : '';
      if (certCode.isNotEmpty) {
        onVerifyCertificate(certCode);
        return;
      }
    }

    // 2. Universal Links: https://hoctructuyen.tinhocgenz.io.vn/app/
    if (uri.path.startsWith('/app') || uri.path.startsWith('/student')) {
      final track = uri.queryParameters['track'] ?? 'office-fast-3in1';
      onOpenTrack(track);
      return;
    }

    // 3. Custom Scheme: eduquest://checkin?pin=1234
    if (uri.scheme == 'eduquest' && uri.host == 'checkin') {
      final pin = uri.queryParameters['pin'] ?? '';
      if (pin.isNotEmpty) {
        onQuickCheckIn(pin);
        return;
      }
    }
  }

  void dispose() {
    _sub?.cancel();
  }
}
