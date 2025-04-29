<?php
/**
 * Leaderboard Firebase Proxy
 *
 * This script acts as a secure proxy between the client and Firebase.
 * It keeps Firebase credentials secure on the server side and handles authentication.
 */

// Aktifkan tampilan error untuk debugging (hapus di production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set appropriate headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CORS headers - restrict to your domain in production
header('Access-Control-Allow-Origin: *'); // Change to your domain in production
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Require the Firebase PHP SDK (you need to install this via Composer)
// If you don't have Composer, you can use the REST API approach instead
// require_once __DIR__ . '/../vendor/autoload.php';

// Firebase configuration
$config = [
    // Pengaturan timeout dan cache
    'timeout' => 10, // seconds
    'cache_time' => 300, // 5 minutes cache

    // Firebase configuration for each platform
    'firebase_config' => [
        'xfun' => [
            'project_id' => '***REMOVED***', // Removed for security
            'api_key' => '***REMOVED***', // Removed for security
            'collection_path' => 'leaderboards',
            'document_id' => 'April-2025',
            'subcollection' => 'entries',
            'order_by' => 'wagered',
            'order_direction' => 'desc'
        ],
        'raingg' => [
            'project_id' => '***REMOVED***', // Removed for security
            'api_key' => '***REMOVED***', // Removed for security
            'collection_path' => 'leaderboards',
            'document_id' => '2025-04-26',
            'data_field' => 'data',
            'order_by' => 'wagered',
            'order_direction' => 'desc'
        ],
        // Tambahkan konfigurasi untuk platform lain jika diperlukan
    ]
];

// Get the requested platform
$platform = isset($_GET['platform']) ? strtolower($_GET['platform']) : '';

// Validate platform parameter
$valid_platforms = ['xfun', 'raingg', 'diceblox', 'hypebet'];
if (!in_array($platform, $valid_platforms)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid platform specified']);
    exit;
}

// Check if we have a cached response
$cache_file = __DIR__ . "/cache/leaderboard_{$platform}.json";
$use_cache = false;

if (file_exists($cache_file)) {
    $cache_time = filemtime($cache_file);
    if ((time() - $cache_time) < $config['cache_time']) {
        $use_cache = true;
    }
}

// Return cached data if available and not expired
if ($use_cache) {
    $cached_data = file_get_contents($cache_file);
    echo $cached_data;
    exit;
}

// Check if we have Firebase configuration for this platform
if (!isset($config['firebase_config'][$platform])) {
    http_response_code(500);
    echo json_encode(['error' => 'Firebase configuration not found for platform: ' . $platform]);
    exit;
}

// Get Firebase configuration for the platform
$firebase_config = $config['firebase_config'][$platform];

// Log for debugging (hapus di production)
error_log("Fetching data from Firebase for platform: " . $platform);

// Since we're not using the Firebase PHP SDK, we'll use the Firebase REST API
// Build the Firebase REST API URL based on the platform's configuration
$firebase_url = '';
$data = [];

try {
    if ($platform === 'xfun') {
        // For XFUN: leaderboards -> April-2025 -> entries -> 1 -> deposited, name, rank, timestamp, wagered
        $firebase_url = "https://firestore.googleapis.com/v1/projects/{$firebase_config['project_id']}/databases/(default)/documents/{$firebase_config['collection_path']}/{$firebase_config['document_id']}/{$firebase_config['subcollection']}";

        // Fetch data from Firebase REST API
        $ch = curl_init($firebase_url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $config['timeout'],
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json'
            ]
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        // Handle errors
        if ($response === false) {
            throw new Exception('Failed to fetch data from Firebase: ' . $curl_error);
        }

        // Check HTTP status code
        if ($http_code !== 200) {
            throw new Exception('Firebase returned error: ' . $http_code);
        }

        // Parse the response
        $firebase_data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response from Firebase');
        }

        // Extract the documents from the response
        if (isset($firebase_data['documents']) && is_array($firebase_data['documents'])) {
            $data = $firebase_data['documents'];
        } else {
            $data = [];
        }
    } elseif ($platform === 'raingg') {
        // For RainGG: leaderboards -> 2025-04-26 -> data -> 0, 1, 2, etc. with avatar, id, username, wagered fields
        $firebase_url = "https://firestore.googleapis.com/v1/projects/{$firebase_config['project_id']}/databases/(default)/documents/{$firebase_config['collection_path']}/{$firebase_config['document_id']}";

        // Fetch data from Firebase REST API
        $ch = curl_init($firebase_url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $config['timeout'],
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json'
            ]
        ]);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        // Handle errors
        if ($response === false) {
            throw new Exception('Failed to fetch data from Firebase: ' . $curl_error);
        }

        // Check HTTP status code
        if ($http_code !== 200) {
            throw new Exception('Firebase returned error: ' . $http_code);
        }

        // Parse the response
        $firebase_data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response from Firebase');
        }

        // Extract the data field from the document
        if (isset($firebase_data['fields'][$firebase_config['data_field']]['arrayValue']['values']) &&
            is_array($firebase_data['fields'][$firebase_config['data_field']]['arrayValue']['values'])) {
            $data = $firebase_data['fields'][$firebase_config['data_field']]['arrayValue']['values'];
        } else {
            $data = [];
        }
    } else {
        throw new Exception('Unsupported platform for Firebase integration: ' . $platform);
    }

    // Log response for debugging (hapus di production)
    error_log("Firebase Response: " . substr(print_r($data, true), 0, 1000) . "...");

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

// Format data ke format yang diharapkan oleh frontend
$formatted_data = [
    'entries' => [],
    'timestamp' => time(),
    'platform' => $platform,
    'total' => 0,
    'source' => 'firebase' // Indicate that data comes from Firebase
];

// Tambahkan debugging untuk melihat struktur data asli
error_log("Raw data structure from Firebase: " . json_encode(is_array($data) ? count($data) : 'not an array'));

// Proses data berdasarkan platform
switch ($platform) {
    case 'xfun':
        // Process XFUN Firebase data structure
        // leaderboards -> April-2025 -> entries -> 1 -> deposited, name, rank, timestamp, wagered
        if (is_array($data)) {
            $entries = [];
            $rank = 1;

            foreach ($data as $doc) {
                if (isset($doc['fields'])) {
                    // Extract fields from Firestore document format
                    $entry = [
                        'rank' => $rank,
                        'name' => isset($doc['fields']['name']['stringValue']) ? $doc['fields']['name']['stringValue'] : 'Unknown',
                        'wagered' => isset($doc['fields']['wagered']['doubleValue']) ? (float)$doc['fields']['wagered']['doubleValue'] :
                                    (isset($doc['fields']['wagered']['integerValue']) ? (int)$doc['fields']['wagered']['integerValue'] : 0),
                        'deposited' => isset($doc['fields']['deposited']['doubleValue']) ? (float)$doc['fields']['deposited']['doubleValue'] :
                                      (isset($doc['fields']['deposited']['integerValue']) ? (int)$doc['fields']['deposited']['integerValue'] : 0),
                        'timestamp' => isset($doc['fields']['timestamp']['integerValue']) ? (int)$doc['fields']['timestamp']['integerValue'] : time()
                    ];

                    $entries[] = $entry;
                    $rank++;
                }
            }

            // Sort entries by wagered amount in descending order
            usort($entries, function($a, $b) {
                return $b['wagered'] <=> $a['wagered'];
            });

            // Update ranks after sorting
            foreach ($entries as $index => $entry) {
                $entries[$index]['rank'] = $index + 1;
            }

            $formatted_data['entries'] = $entries;
            $formatted_data['total'] = count($entries);
        }
        break;

    case 'raingg':
        // Process RainGG Firebase data structure
        // leaderboards -> 2025-04-26 -> data -> 0, 1, 2, etc. with avatar, id, username, wagered fields
        if (is_array($data)) {
            $entries = [];
            $rank = 1;

            foreach ($data as $index => $item) {
                if (isset($item['mapValue']['fields'])) {
                    $fields = $item['mapValue']['fields'];

                    // Extract fields from Firestore document format based on the screenshot
                    $entry = [
                        'rank' => $rank,
                        // From the screenshot, we see the field is named "username"
                        'name' => isset($fields['username']['stringValue']) ? $fields['username']['stringValue'] : 'Unknown',
                        // Try different possible field names for wagered amount
                        'wagered' => isset($fields['wagered']['doubleValue']) ? (float)$fields['wagered']['doubleValue'] :
                                   (isset($fields['wagered']['integerValue']) ? (int)$fields['wagered']['integerValue'] : 0),
                        // From the screenshot, we see the field is named "avatar"
                        'avatar' => isset($fields['avatar']['stringValue']) ? $fields['avatar']['stringValue'] : '',
                        // From the screenshot, we see the field is named "id"
                        'id' => isset($fields['id']['stringValue']) ? $fields['id']['stringValue'] : ''
                    ];

                    // Based on the screenshot, the field is named "wagered_" instead of "wagered"
                    if ($entry['wagered'] === 0) {
                        if (isset($fields['wagered_']['doubleValue'])) {
                            $entry['wagered'] = (float)$fields['wagered_']['doubleValue'];
                        } elseif (isset($fields['wagered_']['integerValue'])) {
                            $entry['wagered'] = (int)$fields['wagered_']['integerValue'];
                        }
                    }

                    // The screenshot shows entries with values like "1325.94" and "475.12000000000006"
                    // This suggests we need to handle floating point values

                    $entries[] = $entry;
                    $rank++;
                }
            }

            // Sort entries by wagered amount in descending order (they should already be sorted, but just to be sure)
            usort($entries, function($a, $b) {
                return $b['wagered'] <=> $a['wagered'];
            });

            // Update ranks after sorting
            foreach ($entries as $index => $entry) {
                $entries[$index]['rank'] = $index + 1;
            }

            $formatted_data['entries'] = $entries;
            $formatted_data['total'] = count($entries);
        }
        break;

    // Tambahkan case untuk platform lain jika diperlukan

    default:
        // Jika format tidak dikenali, gunakan data asli
        $formatted_data['entries'] = [];
        $formatted_data['error'] = 'Unsupported platform or data format';
        break;
}

// Tambahkan debugging untuk melihat hasil pemrosesan
error_log("Processed data: " . json_encode(['total_entries' => count($formatted_data['entries']), 'first_entry' => !empty($formatted_data['entries']) ? $formatted_data['entries'][0] : null]));

// Gunakan data yang sudah diformat
$data = $formatted_data;

// Encode the response
$json_response = json_encode($data);

// Cache the response
if (!is_dir(__DIR__ . '/cache')) {
    mkdir(__DIR__ . '/cache', 0755, true);
}
file_put_contents($cache_file, $json_response);

// Return the response
echo $json_response;
