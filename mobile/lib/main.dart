import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/storage/hive_storage.dart';
import 'core/deep_link/deep_link_handler.dart';
import 'features/auth/presentation/screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Khởi tạo Hive offline storage
  await HiveStorageService.init();

  runApp(const PHEduApp());
}

class PHEduApp extends StatefulWidget {
  const PHEduApp({super.key});

  @override
  State<PHEduApp> createState() => _PHEduAppState();
}

class _PHEduAppState extends State<PHEduApp> {
  final DeepLinkHandler _deepLinkHandler = DeepLinkHandler();
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    _initDeepLinks();
  }

  void _initDeepLinks() {
    _deepLinkHandler.initDeepLinks(
      onOpenTrack: (track) {
        debugPrint('[DeepLink] Mở khóa học: $track');
      },
      onVerifyCertificate: (certCode) {
        debugPrint('[DeepLink] Tra cứu chứng chỉ: $certCode');
      },
      onQuickCheckIn: (pin) {
        debugPrint('[DeepLink] Điểm danh nhanh qua PIN: $pin');
      },
    );
  }

  @override
  void dispose() {
    _deepLinkHandler.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: _navigatorKey,
      title: 'PH DIGITAL EDUCATION',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const LoginScreen(),
    );
  }
}
