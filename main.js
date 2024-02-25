const tableElem = document.getElementById("table");
let tableRows = []; // cтроки таблицы

// если есть сохранённая в localStorage инфа о таблице
if (localStorage.getItem("tableRowsInfo")) {
  tableRows = JSON.parse(localStorage.getItem("tableRowsInfo"));
  updateTableData();
}

class TableItem {
  static #count = 0;
  constructor(name, model, manufacturer, passengers, maxSpeed) {
    this.Id = ++TableItem.#count;
    this.Name = name;
    this.Model = model;
    this.Manufacturer = manufacturer;
    this.Passengers = passengers;
    this.MaxSpeed = maxSpeed;
  }
}

/** Функция для обновления/создания новой таблицы */
function updateTableData() {
  tableElem.innerHTML = createTableLayout(tableRows);
}

/** Функция вызывается при клике на кнопку "Загрузить данные" */
function getNewData() {
  loadData().then((data) => {
    tableRows = data.map(
      (item) =>
        new TableItem(
          item.name,
          item.model,
          item.manufacturer,
          item.passengers,
          item.max_atmosphering_speed
        )
    );
    updateTableData();
  });
}

/** Функция вызывается при клике на кнопку "Очистить", удаляет таблицу с данными */
function clearTableData() {
  localStorage.removeItem("tableRowsInfo");
  tableElem.innerHTML = `<div>Данные отсутствуют</div>`;
}

/** Функция сохраняет информацию о строках в localStorage*/
function saveTableData() {
  if (!tableRows.length) {
    return;
  }
  localStorage.setItem("tableRowsInfo", JSON.stringify(tableRows));
}

/**
 * Функция для удаления строки из таблицы
 * @param {number} rowId Id строки
 */
function deleteRow(rowId) {
  tableRows = tableRows.filter((row) => row.Id !== rowId);
  updateTableData();
}

/**
 * Функция для сортировки по полю
 * @param {string} fieldName Название поля
 */
function sortByField(fieldName) {
  const fieldInfo = {
    Название: "Name",
    Модель: "Model",
    Производитель: "Manufacturer",
    Вместимость: "Passengers",
    "Максимальная скорость": "MaxSpeed",
  };
  const field = fieldInfo[fieldName];
  if (!field) {
    return;
  }
  tableRows.sort((a, b) => a[field].localeCompare(b[field]));
  updateTableData();
}

/** Функция для загрузки данных по API */
async function loadData() {
  const url = "https://swapi.dev/api/starships";
  const preloader = document.getElementById("preloader");
  preloader.style.display = "flex";
  try {
    const response = await fetch(url);
    const data = await response.json();
    preloader.style.display = "none";
    return data.results;
  } catch (err) {
    preloader.style.display = "none";
    alert("Произошла ошибка при загрузке данных");
  }
}

/**
 * Функция для создания разметки таблицы
 * @param {TableItem[]} rows массив с информацией по строкам
 * @returns строка с HTML-разметкой
 */
function createTableLayout(rows) {
  /**
   * Функция длм создания разметки строки
   * @param {TableItem} row
   * @returns строка с HTML-разметкой
   */
  function createTableRowLayout(row) {
    return `
      <tr>
		    <td>${row.Name}</td>
		    <td>${row.Model}</td>
		    <td>${row.Manufacturer}</td>
        <td>${row.Passengers}</td>
		    <td>${row.MaxSpeed}</td>
        <td style="width: 80px; text-align: center">
          <button onclick="deleteRow(${row.Id})">Удалить</button>
        </td>
	    </tr>
    `;
  }
  let rowsLayout = "";
  rows.forEach((row) => {
    rowsLayout += createTableRowLayout(row);
  });
  return `
    <table>
      <thead>
        <tr>
          <th class="sortable" onclick="sortByField('Название')">Название</th>
          <th class="sortable" onclick="sortByField('Модель')">Модель</th>
          <th class="sortable" onclick="sortByField('Производитель')">Производитель</th>
          <th class="sortable" onclick="sortByField('Вместимость')">Вместимость</th>
          <th class="sortable" onclick="sortByField('Максимальная скорость')">Максимальная скорость</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rowsLayout}
      </tbody>
    </table>
  `;
}
