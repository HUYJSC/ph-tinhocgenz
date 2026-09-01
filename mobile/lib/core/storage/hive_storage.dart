import 'package:hive_flutter/hive_flutter.dart';

class HiveStorageService {
  static const String quizBoxName = 'offline_quizzes_box';
  static const String attemptsBoxName = 'offline_attempts_queue';
  static const String settingsBoxName = 'app_settings_box';

  static Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox(quizBoxName);
    await Hive.openBox(attemptsBoxName);
    await Hive.openBox(settingsBoxName);
  }

  // Cache đề thi offline
  static Future<void> cacheQuizzes(List<Map<String, dynamic>> quizzes) async {
    final box = Hive.box(quizBoxName);
    await box.put('cached_list', quizzes);
    await box.put('last_cached_at', DateTime.now().toIso8601String());
  }

  static List<dynamic> getCachedQuizzes() {
    final box = Hive.box(quizBoxName);
    return box.get('cached_list', defaultValue: []);
  }

  // Hàng đợi lưu kết quả thi offline khi mất mạng
  static Future<void> queueOfflineAttempt(Map<String, dynamic> attemptData) async {
    final box = Hive.box(attemptsBoxName);
    final currentQueue = List<Map<String, dynamic>>.from(
      box.get('pending_sync_queue', defaultValue: []),
    );
    currentQueue.add(attemptData);
    await box.put('pending_sync_queue', currentQueue);
  }

  static List<Map<String, dynamic>> getPendingAttempts() {
    final box = Hive.box(attemptsBoxName);
    final raw = box.get('pending_sync_queue', defaultValue: []);
    return List<Map<String, dynamic>>.from(raw);
  }

  static Future<void> clearPendingAttempts() async {
    final box = Hive.box(attemptsBoxName);
    await box.put('pending_sync_queue', []);
  }
}
