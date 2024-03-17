let dataBooks = [];
const LS_KEY = 'lsBooks';
let idUpdate = 0;
const LOAD_BOOKS = 'load-books';
let textBtn = document.getElementById('bookSubmit');

async function GetRequest(to) {
    try {
        const response = await fetch(`http://localhost/smkti/restapi-bookshelf-level1/${to}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        if (data.error) {
            message('error', 'Gagal', data.error);
            return false;
        }
        return data;
    } catch (error) {
        console.error('Error:', error);
        message('error', 'Gagal', 'Gagal');
        return false;
    }
}

async function PostRequestJSON(to, data) {
    try {
        const response = await fetch(`http://localhost/smkti/restapi-bookshelf-level1/${to}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        message('error', 'Gagal', 'Gagal');
        return false;
    }
}

async function PostRequest(to, data) {
    try {
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        const response = await fetch(`http://localhost/smkti/restapi-bookshelf-level1/${to}`, {
            method: 'POST',
            body: formData
        });

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        message('error', 'Gagal', 'Gagal');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const submitForm = document.getElementById('inputBook'),
        searchForm = document.getElementById('searchBook');
    submitForm.addEventListener('submit', function (ev) {
        ev.preventDefault();

        if (idUpdate != 0) {
            updateBook();
        } else {
            addBook();
        }
    });
    searchForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        let nilai = ev.target[0].value;
        cariLikeTitle(nilai);
    });
    await loadDataBook()
    document.dispatchEvent(new Event(LOAD_BOOKS))
    // if (isStorageExist()) getDataLocalStorage();
})

document.addEventListener(LOAD_BOOKS, function () {
    addElementHtmlContent();
});

function addElementHtmlContent(dtBooksFind = false) {
    const belumDibaca = document.getElementById('incompleteBookshelfList'),
        sudahDibaca = document.getElementById('completeBookshelfList');

    belumDibaca.innerHTML = '';
    sudahDibaca.innerHTML = '';

    if (!dtBooksFind) dtBooksFind = dataBooks;

    for (const book of dtBooksFind) {
        const todoElement = makeBookElement(book);
        if (parseInt(book.isComplete)) {
            sudahDibaca.append(todoElement);
        } else {
            belumDibaca.append(todoElement);
        }
    }
}

async function cariLikeTitle(nilai) {

    document.getElementById('searchBookTitle').focus();
    if (nilai === '') {
        await loadDataBook();
        document.dispatchEvent(new Event(LOAD_BOOKS));
        return;
    }
    await loadDataBook(`?q=${nilai}`);
    const bookSesuai = [];
    for (const book of dataBooks) {
        if (book.title.toLowerCase().includes(nilai.toLowerCase())) {
            bookSesuai.push(book);
        }
    }
    addElementHtmlContent(bookSesuai);
}

function getInputBooks() {
    const title = document.querySelector("#inputBookTitle"),
        author = document.querySelector("#inputBookAuthor"),
        year = document.querySelector("#inputBookYear"),
        dibaca = document.querySelector("#inputBookIsComplete");
    return {
        title: title,
        author: author,
        year: year,
        dibaca: dibaca,
    }
}

function makeBookElement(dataBookObj) {

    const {id, title, author, year, isComplete} = dataBookObj;

    const contentIconGroup = document.createElement('div');
    contentIconGroup.classList.add('display-flex', 'text-align-center', 'icon-group');

    const contentIconBooks = document.createElement('div');
    contentIconBooks.classList.add('icon-books');

    const textPenulis = document.createElement('p');
    textPenulis.innerText = `Penulis: ${author}`;
    contentIconGroup.append(contentIconBooks, textPenulis);

    const textTitle = document.createElement('h3');
    textTitle.innerText = title;

    const textTahun = document.createElement('p');
    textTahun.innerText = `Tahun: ${year}`;

    const contArticle = document.createElement('article');
    contArticle.classList.add('book_item');
    contArticle.append(contentIconGroup, textTitle, textTahun);
    contArticle.setAttribute('id', `book-${id}`);

    const textBtnGreen = document.createElement('button');
    textBtnGreen.classList.add('outline', 'green');

    const textBtnRed = document.createElement('button');
    textBtnRed.classList.add('outline', 'red');
    textBtnRed.innerText = `Hapus Buku`;
    textBtnRed.addEventListener('click', function (ev) {
        deleteBook(id);
    });

    const textBtnWar = document.createElement('button');
    textBtnWar.classList.add('outline', 'warning');
    textBtnWar.innerText = `Edit Buku`;
    textBtnWar.addEventListener('click', function (ev) {
        editBook(id);
    });

    const contentAction = document.createElement('div');
    contentAction.classList.add('action');

    if (parseInt(isComplete)) {
        textBtnGreen.innerText = `Belum selesai di Baca`;
        textBtnGreen.addEventListener('click', function (ev) {
            fnUpdateBaca(id, 'belum');
        });
    } else {
        textBtnGreen.innerText = `Selesai dibaca`;
        textBtnGreen.addEventListener('click', function (ev) {
            fnUpdateBaca(id, 'selesai');
        });
    }
    contentAction.append(textBtnGreen, textBtnWar, textBtnRed);
    contArticle.append(contentAction);

    return contArticle;
}

function findBook(itemBook, jenis = 'id') {
    for (const bookItem of dataBooks) {
        if (jenis === 'id') {
            if (bookItem.id === itemBook) {
                return bookItem;
            }
        } else {
            if (bookItem.title === itemBook) {
                return false;
            }
        }
    }
    return null;
}

function findBookSesuaiId(title, id) {
    for (const bookItem of dataBooks) {
        if (bookItem.title === title && bookItem.id != id) {
            return false;
        }
    }
    return null;
}

function getDataLocalStorage() {
    const serializedData = localStorage.getItem(LS_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const todo of data) {
            dataBooks.push(todo);
        }
    }
    document.dispatchEvent(new Event(LOAD_BOOKS))
}

function findIndexBook(id) {
    for (const index in dataBooks) {
        if (dataBooks[index].id === id) {
            return index;
        }
    }
    return -1;
}

function editBook(id) {
    idUpdate = id;
    let itemBook = findBook(id);
    let dtInp = getInputBooks();
    dtInp.title.value = itemBook.title;
    dtInp.author.value = itemBook.author;
    dtInp.year.value = itemBook.year;
    dtInp.dibaca.checked = !!parseInt(itemBook.isComplete);

    handlerButton(dtInp.dibaca.checked);
    document.getElementById('inputBookTitle').focus();
}

async function addBook() {
    const getInp = getInputBooks(),
        cekTitle = await findBook(getInp.title.value, 'title');

    if (cekTitle === false) {
        getInp.title.focus;
        message('info', 'Pemberitahuan', 'Judul Sudah Ada');
        return;
    }

    const booksObj = {
        id: generateId(),
        title: getInp.title.value,
        author: getInp.author.value,
        year: getInp.year.value,
        isComplete: getInp.dibaca.checked ? 1 : 0
    };
    // dataBooks.push(booksObj);
    const result = await PostRequest('book-post.php', booksObj);
    if (result.error) {
        message('error', 'Gagal', result.error);
        return false;
    }
    if (result.data) {
        dataBooks.push(result.data);
        saveData('add');
    }
    // loadDataBook();
}

async function fnUpdateBaca(bookId, jenis) {
    const cekTitle = findBook(bookId, 'title');

    if (cekTitle === false) {
        message('info', 'Pemberitahuan', 'Judul Sudah Ada');
        return;
    }
    const getBooksList = findBook(bookId);
    if (getBooksList === null) return;

    const result = await PostRequest(`book-iscomplete-put.php?id=${bookId}`, {isComplete: (jenis === 'selesai' ? 1 : 0)});

    if (!result || result.error) {
        message('error', 'Gagal', 'Proses Update lambat!')
        return;
    }

    loadDataBook();
    getBooksList.isComplete = jenis === 'selesai';
    saveData('putComplet', jenis === 'selesai' ? `Buku <b>${getBooksList.title}</b> Selesai Dibaca` : `Buku <b>${getBooksList.title}</b> Belum Selesai Dibaca`);
}

async function updateBook() {
    let dtInp = getInputBooks();
    const cekTitle = findBookSesuaiId(dtInp.title.value, idUpdate);

    if (cekTitle === false) {
        message('info', 'Pemberitahuan', 'Judul Sudah Ada');
        return;
    }
    const getBooksList = findBook(idUpdate);
    if (getBooksList === null) return;

    getBooksList.title = dtInp.title.value;
    getBooksList.year = dtInp.year.value;
    getBooksList.author = dtInp.author.value;
    getBooksList.isComplete = dtInp.dibaca.checked;

    let jenis = dtInp.dibaca.checked ? 'selesai' : 'belum';

    const result = await PostRequest(`book-put.php?id=${idUpdate}`, {...getBooksList, isComplete: getBooksList.isComplete ? 1 : 0});
    if (!result || result.error) {
        message('error', 'Gagal', result.error)
        return;
    }
    loadDataBook();
    saveData('putComplet', jenis === 'selesai' ? `Buku <b>${getBooksList.title}</b> Selesai Dibaca` : `Buku <b>${getBooksList.title}</b> Belum Selesai Dibaca`);
}

function deleteBook(idBook) {
    Swal.fire({
        title: 'Yakin Hapus Data?',
        text: "Data akan di hilangkan dari rak Buku",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Y, Hapus.'
    }).then( async (result) => {
        if (result.isConfirmed) {

            const todoTarget = findIndexBook(idBook);
            const result = await PostRequest(`book-delete.php?id=${idBook}`, {});

            if (!result || result.error) {
                message('error', 'Gagal', 'Proses Hapus lambat!')
                return;
            }

            dataBooks.splice(todoTarget, 1);
            saveData('remove');
        }
    })
}

function klikDibaca(ev) {
    handlerButton(ev.target.checked);
}

function klikBatal() {
    textBtn.innerHTML = `Masukkan Buku ke rak <span>Belum selesai dibaca</span>`;
    idUpdate = 0;
    document.getElementById('inputBookTitle').focus();
}

function saveData(res, msg = '') {
    if (isStorageExist()) {
        const parsed = JSON.stringify(dataBooks);
        localStorage.setItem(LS_KEY, parsed);
        document.getElementById('inputBook').reset();

        if (res === 'add') {
            message('success', 'Add Berhasil', 'Data berhasil di simpan.');
        } else if (res === 'putComplet') {
            message('success', 'Update Berhasil', msg);
        } else if (res === 'remove') {
            message('success', 'Delete Berhasil', 'Data berhasil di hapus.');
        } else {
            message();
        }
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function handlerButton(dibaca) {

    if (idUpdate === 0) {

        if (dibaca) {
            textBtn.innerHTML = `Masukkan Buku ke rak <span>Selesai dibaca</span>`;
        } else {
            textBtn.innerHTML = `Masukkan Buku ke rak <span>Belum selesai dibaca</span>`;
        }

    } else {
        if (dibaca) {
            textBtn.innerHTML = `Update Buku <span>Selesai dibaca</span>`;
        } else {
            textBtn.innerHTML = `Update Buku <span>Belum selesai dibaca</span>`;
        }
    }
}

function generateId() {
    return +new Date();
}

function message(icon = 'error', title = 'Gagal', message = 'Proses Lambat, Ulangi lagi!') {
    Swal.fire({
        icon: icon,
        title: title,
        html: message,
    }).then(() => {
        document.dispatchEvent(new Event(LOAD_BOOKS));
    })
}

async function loadDataBook(params = "") {
    const resultBook = await GetRequest(`book-get.php${params}`);
    if (resultBook) {
        dataBooks = resultBook.data;
    }
}
