<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Origin: *'); // Izinkan permintaan dari semua sumber lintas asal
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE'); // Izinkan metode GET, POST, PUT, DELETEw
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Izinkan header Content-Type dan Authorization
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
//    http_response_code(405);
    echo json_encode(["error" => "method tidak sesuai"]);
    exit();
}
require_once __DIR__ . "/koneksi.php";
$requiredFields = ['title', 'author', 'year', 'isComplete'];
$missingFields = [];

// Cek apakah setiap kunci yang diperlukan ada dalam $_POST dan tidak kosong
foreach ($requiredFields as $field) {
    if (empty($_POST[$field]) && $_POST[$field]!=0) {
        $missingFields[] = $field;
    }
}
if (empty($missingFields)) {
    $title = htmlspecialchars($_POST['title'], true);
    // Mengambil data yang baru saja di-create
    $sql = "SELECT * FROM book WHERE title ='$title' limit 1";
    $query = mysqli_query($conn, $sql);
    $cekTitle = mysqli_fetch_all($query, MYSQLI_ASSOC);
    if (sizeof($cekTitle)) {
        http_response_code(400);
        echo json_encode([
            "error" => "Data $title sudah ada."
        ]);
        exit();
    }
    $author = $_POST['author'];
    $year = $_POST['year'];
    $isComplete = $_POST['isComplete'];
    $sql = "INSERT INTO book (id, title, year, author, isComplete) VALUES(null, '$title','$year','$author','$isComplete')";
    $query = mysqli_query($conn, $sql);

    if ($query) {
        // Insert data berhasil
        $insertedId = mysqli_insert_id($conn);

        // Mengambil data yang baru saja di-create
        $sql = "SELECT * FROM book WHERE id = $insertedId";
        $query = mysqli_query($conn, $sql);
        $result = mysqli_fetch_all($query, MYSQLI_ASSOC);

        $response = ["data" => []];
        foreach ($result as $row) {
            $response = [
                "data" => $row
            ];
        }
        http_response_code(200);
        echo json_encode($response);
        exit();
    }
    http_response_code(400);
    echo json_encode([
        "error" => "Gagal memasukkan data ke dalam database"
    ]);
    exit();
}
// Data $_POST tidak lengkap, berikan pesan kesalahan dengan kunci yang tidak terpenuhi
$missingFieldsString = implode(', ', $missingFields);
http_response_code(400);
echo json_encode([
    "error" => "Data tidak lengkap. Kunci yang harus dipenuhi: " . $missingFieldsString
]);

