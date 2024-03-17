<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Origin: *'); // Izinkan permintaan dari semua sumber lintas asal
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE'); // Izinkan metode GET, POST, PUT, DELETE
header('Access-Control-Allow-Headers: Content-Type, Authorization'); // Izinkan header Content-Type dan Authorization
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["error" => "method tidak sesuai"]);
    exit();
}
require_once __DIR__ . "/koneksi.php";
if (isset($_REQUEST['q'])) {
    $sql = "SELECT * FROM book where title LIKE '%" . $_REQUEST['q'] . "%' ORDER BY title ASC";
} else {
    $sql = "SELECT * FROM book ORDER BY id DESC";
}
$query = mysqli_query($conn, $sql);

if ($query) {
    $result = mysqli_fetch_all($query, MYSQLI_ASSOC);
    $rows = [];
    foreach ($result as $row) {
        $rows[] = $row;
    }

    $jmlData = count($rows);

    $resMeta = array(
        "page" => isset($_GET['page']) ? $_GET['page'] : 0,
        "limit" => isset($_GET['limit']) ? $_GET['limit'] : null
    );
    $resMeta['total'] = sizeof($rows);

    $response = array(
        "data" => $rows,
    );

    http_response_code(200);
    echo json_encode($response);
    exit();
}

// Error handling if query fails
http_response_code(500);
echo json_encode(array("error" => "Gagal ambil data ke database."));
exit();