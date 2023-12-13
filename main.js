const STORAGE_KEY = 'BOOKSHELF_APPS';
let books = [];

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
  document.dispatchEvent(new Event('ondatasaved'));
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) books = data;

  document.dispatchEvent(new Event('ondataloaded'));
}

function updateDataToStorage() {
  if (isStorageExist()) saveData();
}

function composeBookObject(title, author, year, isComplete) {
  return {
    id: +new Date(),
    title,
    author,
    year: Number(year),
    isComplete,
  };
}

function findBook(bookId) {
  for (book of books) {
    if (book.id === bookId) return book;
  }
  return null;
}

function findBookIndex(bookId) {
  let index = 0;
  for (book of books) {
    if (book.id === bookId) return index;

    index++;
  }

  return -1;
}

const UNCOMPLETED_LIST_BOOK_ID = 'incompleteBookshelfList';
const COMPLETED_LIST_BOOK_ID = 'completeBookshelfList';
const BOOK_ITEMID = 'itemId';

function addBook() {
  const uncompletedBookList = document.getElementById(UNCOMPLETED_LIST_BOOK_ID);
  const completedBookList = document.getElementById(COMPLETED_LIST_BOOK_ID);

  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = document.getElementById('inputBookYear').value;
  const bookIsComplete = document.getElementById('inputBookIsComplete').checked;

  const book = createBook(bookTitle, bookAuthor, bookYear, bookIsComplete);
  const bookObject = composeBookObject(
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete
  );

  book[BOOK_ITEMID] = bookObject.id;
  books.push(bookObject);

  if (bookIsComplete) {
    completedBookList.append(book);
  } else {
    uncompletedBookList.append(book);
  }
  updateDataToStorage();
}

function createBook(bookTitle, bookAuthor, bookYear, isComplete) {
  const btnComplted = document.createElement('button');
  if (isComplete) {
    btnComplted.classList.add('blue');
    btnComplted.innerText = 'Belum selesai dibaca';
    btnComplted.addEventListener('click', function (event) {
      undoBookFromCompleted(event.target.parentElement);
    });
  } else {
    btnComplted.classList.add('green');
    btnComplted.innerText = 'Udah Baca';
    btnComplted.addEventListener('click', function (event) {
      addBookToCompleted(event.target.parentElement);
    });
  }

  const btnHapus = document.createElement('button');
  btnHapus.classList.add('red');
  btnHapus.innerText = 'Hapus buku';

  btnHapus.addEventListener('click', function (event) {
    removeBookFromCompleted(event.target.parentElement);
  });

  const divAction = document.createElement('div');
  divAction.classList.add('action');
  divAction.append(btnComplted, btnHapus);

  const title = document.createElement('h3');
  title.innerText = bookTitle;

  const author = document.createElement('p');
  author.innerHTML = `Penulis: <span>${bookAuthor}</span>`;

  const year = document.createElement('p');
  year.innerHTML = `Tahun: <span>${bookYear}</span>`;

  const bookDesc = document.createElement('article');
  bookDesc.classList.add('book_item');
  bookDesc.classList.add('book_item');
  bookDesc.append(title, author, year, divAction);

  return bookDesc;
}

function addBookToCompleted(bookElement) {
  const target = bookElement;
  bookElement = target.parentElement;
  const listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);
  const bookTitle = bookElement.querySelector('.book_item h3').innerText;
  const bookAuthor = bookElement.querySelector(
    '.book_item p:nth-child(2) span'
  ).innerText;
  const bookYear = bookElement.querySelector(
    '.book_item p:nth-child(3) span'
  ).innerText;

  const newBook = createBook(bookTitle, bookAuthor, bookYear, true);
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isComplete = true;
  newBook[BOOK_ITEMID] = book.id;

  listCompleted.append(newBook);
  bookElement.remove();

  updateDataToStorage();
}

function undoBookFromCompleted(bookElement) {
  const target = bookElement;
  bookElement = target.parentElement;
  const listUncompleted = document.getElementById(UNCOMPLETED_LIST_BOOK_ID);
  const bookTitle = bookElement.querySelector('.book_item h3').innerText;
  const bookAuthor = bookElement.querySelector(
    '.book_item p:nth-child(2) span'
  ).innerText;
  const bookYear = bookElement.querySelector(
    '.book_item p:nth-child(3) span'
  ).innerText;

  const newBook = createBook(bookTitle, bookAuthor, bookYear, false);

  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isComplete = false;
  newBook[BOOK_ITEMID] = book.id;

  listUncompleted.append(newBook);
  bookElement.remove();

  updateDataToStorage();
}

function refreshDataFromBooks() {
  const listUncompleted = document.getElementById(UNCOMPLETED_LIST_BOOK_ID);
  let listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);

  for (book of books) {
    const newBook = createBook(
      book.title,
      book.author,
      book.year,
      book.isComplete
    );
    newBook[BOOK_ITEMID] = book.id;

    if (book.isComplete) {
      listCompleted.append(newBook);
    } else {
      listUncompleted.append(newBook);
    }
  }
}

function removeBookFromCompleted(bookElement) {
  const target = bookElement;
  const book = target.parentElement;
  const bookPosition = findBookIndex(book[BOOK_ITEMID]);

  Swal.fire({
    title: 'Apakah anda ingin menghapus buku?',
    text: '',
    icon: 'warning',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Iya',
    denyButtonText: 'Tidak',
    showCancelButton: false,
  }).then((result) => {
    if (result.value) {
      books.splice(bookPosition, 1);
      book.remove();
      updateDataToStorage();
      Swal.fire('Deleted!', 'Buku Berhasil di Hapus', 'success');
    }
  });
}

const searchBook = document.getElementById('searchBookTitle');
const btnSearch = document.getElementById('searchSubmit');

function searchData() {
  const searchBook = document
    .getElementById('searchBookTitle')
    .value.toLowerCase();
  const books = document.querySelectorAll('.book_item');

  books.forEach((book) => {
    const bookDesc = book.childNodes[0];
    const bookTitle = bookDesc.firstChild.textContent.toLowerCase();

    if (bookTitle.indexOf(searchBook) != -1) {
      book.setAttribute('style', 'display: block;');
    } else {
      book.setAttribute('style', 'display: none !important;');
    }
  });
}

btnSearch.addEventListener('click', searchData);
searchBook.addEventListener('keyup', searchData);

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');

  function clearForm() {
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookIsComplete').checked = false;
  }

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
    clearForm();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener('ondatasaved', () => {
  console.log('Data berhasil disimpan.');
});

document.addEventListener('ondataloaded', () => {
  refreshDataFromBooks();
});

document
  .getElementById('inputBookIsComplete')
  .addEventListener('click', function () {
    if (document.getElementById('inputBookIsComplete').checked) {
      document.getElementById('noteComplete').innerHTML = 'Selesai dibaca';
    } else {
      document.getElementById('noteComplete').innerHTML =
        'Belum selesai dibaca';
    }
  });
