import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'https://hoctructuyen.tinhocgenz.io.vn/api/v1';
  final Dio dio;
  final FlutterSecureStorage secureStorage;

  ApiClient({Dio? customDio, FlutterSecureStorage? customStorage})
      : dio = customDio ??
            Dio(BaseOptions(
              baseUrl: baseUrl,
              connectTimeout: const Duration(seconds: 15),
              receiveTimeout: const Duration(seconds: 15),
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            )),
        secureStorage = customStorage ?? const FlutterSecureStorage() {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final accessToken = await secureStorage.read(key: 'access_token');
          if (accessToken != null && accessToken.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $accessToken';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Xử lý tự động làm mới Token khi Access Token hết hạn (401)
          if (error.response?.statusCode == 401) {
            final refreshToken = await secureStorage.read(key: 'refresh_token');
            if (refreshToken != null && refreshToken.isNotEmpty) {
              try {
                final refreshResponse = await Dio().post(
                  '$baseUrl/accounts/token/refresh/',
                  data: {'refresh_token': refreshToken},
                );

                if (refreshResponse.statusCode == 200) {
                  final newAccessToken = refreshResponse.data['tokens']['access'];
                  await secureStorage.write(key: 'access_token', value: newAccessToken);

                  // Thực hiện lại request ban đầu với token mới
                  final clonedRequest = error.requestOptions;
                  clonedRequest.headers['Authorization'] = 'Bearer $newAccessToken';
                  final retryResponse = await dio.fetch(clonedRequest);
                  return handler.resolve(retryResponse);
                }
              } catch (_) {
                // Refresh token cũng hết hạn -> Xóa storage để người dùng đăng nhập lại
                await secureStorage.deleteAll();
              }
            }
          }
          return handler.next(error);
        },
      ),
    );
  }
}
