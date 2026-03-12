// SCP Foundation Document Generator
// Copyright (C) 2026 Ptaxa Dev

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// ======== Глобальные переменные ========
let uploadedImages = {};

// ======== Цвета для классов объектов ========
const classColors = {
  'Safe': '#2e8b57',      // Тёмно-зелёный
  'Euclid': '#b22222',    // Мягкий красный (по умолчанию)
  'Keter': '#8b0000',     // Тёмно-красный
  'Thaumiel': '#4a6da8',  // Приглушённый синий
  'Apollyon': '#4a2c2c',  // Тёмный бордовый
  'Neutralized': '#6a6a6a' // Серый
};

// ======== Обновление метаданных ========

function updateMetadata() {
  const itemValue = document.getElementById("item").value.trim() || "SCP-173";
  const classValue = document.getElementById("class").value || "Euclid";
  
  document.getElementById("p_item").textContent = itemValue;
  document.getElementById("p_class").textContent = classValue;
  
  // Обновляем цвет акцента в зависимости от класса (но не трогаем текст метаданных)
  updateAccentColor(classValue);
}

// ======== Обновление цвета акцента ========
function updateAccentColor(className) {
  const color = classColors[className] || '#b22222'; // По умолчанию Euclid red
  
  // Обновляем CSS переменные в корневом элементе
  document.documentElement.style.setProperty('--color-accent', color);
  document.documentElement.style.setProperty('--color-accent-dark', adjustBrightness(color, -20));
  document.documentElement.style.setProperty('--color-accent-hover', adjustBrightness(color, 20));
  
  console.log('Цвет изменён на:', color, 'для класса:', className); // Для отладки
}

// ======== Вспомогательная функция для изменения яркости цвета ========
function adjustBrightness(hex, percent) {
  if (!hex) return '#000000';
  
  // Проверяем, что это hex
  if (hex.startsWith('#')) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    r = Math.min(255, Math.max(0, Math.round(r + (r * percent / 100))));
    g = Math.min(255, Math.max(0, Math.round(g + (g * percent / 100))));
    b = Math.min(255, Math.max(0, Math.round(b + (b * percent / 100))));
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  
  return hex;
}

// ======== Обёртка текста в теги ========
function wrapText(before, after) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  
  if (!selectedText) {
    alert("Выделите текст для форматирования");
    return;
  }
  
  const container = range.commonAncestorContainer;
  const isEditable = container.nodeType === 3 
    ? container.parentElement.closest('.content-area')
    : container.closest('.content-area');
    
  if (!isEditable) {
    alert("Можно редактировать только текст в белой области");
    return;
  }
  
  const span = document.createElement("span");
  span.textContent = before + selectedText + after;
  
  range.deleteContents();
  range.insertNode(span);
  
  selection.removeAllRanges();
}

// ======== Добавление редакции ========
function addRedaction() {
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.isCollapsed) {
    alert("Выделите текст, который хотите заредачировать");
    return;
  }

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const isEditable = container.nodeType === 3 
    ? container.parentElement.closest('.content-area')
    : container.closest('.content-area');
    
  if (!isEditable) {
    alert("Можно редактировать только текст в белой области");
    return;
  }

  const selectedText = range.toString();
  const redactionLength = selectedText.length;
  
  const redactionText = '█'.repeat(Math.max(redactionLength, 3));
  
  const span = document.createElement("span");
  span.className = "redacted";
  span.textContent = redactionText;
  span.title = "Двойной клик - удалить";
  span.style.minWidth = (redactionLength * 0.8) + 'em';

  range.deleteContents();
  range.insertNode(span);

  span.addEventListener("dblclick", function(e) {
    e.stopPropagation();
    if (confirm("Удалить редакцию?")) {
      this.remove();
    }
  });

  selection.removeAllRanges();
}

// ======== Добавление категории ========
function addCategory() {
  const input = document.getElementById('newCategory');
  const categoryName = input.value.trim();
  
  if (!categoryName) {
    alert('Введите название категории');
    return;
  }
  
  addCategoryToDocument(categoryName);
  addCategoryToList(categoryName);
  
  input.value = '';
}

function addCategoryToList(name) {
  const list = document.getElementById('categories-list');
  
  if (list.children.length === 1 && list.children[0].classList.contains('tool-hint')) {
    list.innerHTML = '';
  }
  
  const item = document.createElement('div');
  item.className = 'category-item';
  item.innerHTML = `
    <span class="category-name">${name}</span>
    <div class="category-actions">
      <button onclick="removeCategory('${name}')" title="Удалить">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  list.appendChild(item);
}

function addCategoryToDocument(name) {
  const container = document.getElementById('custom-categories-container');
  
  const section = document.createElement('div');
  section.className = 'section';
  section.dataset.categoryName = name;
  
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = name.toUpperCase();
  title.setAttribute('contenteditable', 'false');
  
  const content = document.createElement('div');
  content.className = 'content-area';
  content.setAttribute('contenteditable', 'true');
  content.style.color = '#000';
  content.innerHTML = `Введите текст для ${name}...`;
  
  section.appendChild(title);
  section.appendChild(content);
  
  container.appendChild(section);
}

function removeCategory(name) {
  if (confirm(`Удалить категорию "${name}"?`)) {
    const sections = document.querySelectorAll(`.section[data-category-name="${name}"]`);
    sections.forEach(section => section.remove());
    
    const items = document.querySelectorAll('.category-item');
    items.forEach(item => {
      if (item.querySelector('.category-name').textContent === name) {
        item.remove();
      }
    });
    
    const list = document.getElementById('categories-list');
    if (list.children.length === 0) {
      list.innerHTML = '<div class="tool-hint" style="margin-top:0;">Нет категорий</div>';
    }
  }
}

// ======== Загрузка изображения ========
function uploadImage() {
  const input = document.getElementById('imageUpload');
  const imageNameInput = document.getElementById('imageName');
  
  if (!input.files || !input.files[0]) {
    alert('Выберите файл изображения');
    return;
  }
  
  const file = input.files[0];
  let imageName = imageNameInput.value.trim();
  
  if (!imageName) {
    imageName = file.name.split('.')[0];
  }
  
  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите изображение');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedImages[imageName] = e.target.result;
    
    const selection = window.getSelection();
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode(`[img:${imageName}]`);
      range.insertNode(textNode);
      range.collapse(false);
    }
    
    updateImageCount();
    
    input.value = '';
    imageNameInput.value = '';
    
    alert(`Изображение "${imageName}" загружено!`);
  };
  
  reader.readAsDataURL(file);
}

function updateImageCount() {
  document.getElementById("imageCount").textContent = Object.keys(uploadedImages).length;
}

function showImageLibrary() {
  const imageNames = Object.keys(uploadedImages);
  
  if (imageNames.length === 0) {
    alert('Нет загруженных изображений');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'image-modal library-modal';
  
  let imagesHtml = '';
  imageNames.forEach(name => {
    imagesHtml += `
      <div class="library-item">
        <img src="${uploadedImages[name]}" alt="${name}" 
             onclick="insertImageTag('${name}')">
        <div class="library-item-name">${name}</div>
        <div class="library-item-actions">
          <button onclick="insertImageTag('${name}')" title="Вставить">
            <i class="fas fa-plus"></i> Вставить
          </button>
          <button onclick="deleteImage('${name}')" title="Удалить">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  modal.innerHTML = `
    <div class="modal-content library-content">
      <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h3><i class="fas fa-images"></i> Библиотека изображений</h3>
      <div class="library-grid">
        ${imagesHtml}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function insertImageTag(imageName) {
  const selection = window.getSelection();
  if (selection.rangeCount) {
    const range = selection.getRangeAt(0);
    const textNode = document.createTextNode(`[img:${imageName}]`);
    range.insertNode(textNode);
    range.collapse(false);
  }
  
  document.querySelector('.image-modal')?.remove();
}

function deleteImage(imageName) {
  if (confirm(`Удалить изображение "${imageName}"?`)) {
    delete uploadedImages[imageName];
    updateImageCount();
    document.querySelector('.image-modal')?.remove();
    showImageLibrary();
  }
}

// ======== Генерация PDF ========
function generatePDF() {
  const element = document.getElementById("document");
  const itemName = document.getElementById("p_item").textContent || "SCP-173";
  
  const editableElements = element.querySelectorAll('[contenteditable="true"]');
  editableElements.forEach(el => {
    el.dataset.wasEditable = 'true';
    el.setAttribute('contenteditable', 'false');
  });
  
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${itemName.replace(/[^a-z0-9]/gi, '_')}.pdf`,
    html2canvas: { 
      scale: 2, 
      allowTaint: true, 
      useCORS: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait'
    }
  };
  
  html2pdf().from(element).set(opt).save().then(() => {
    editableElements.forEach(el => {
      el.setAttribute('contenteditable', 'true');
    });
  });
}

// ======== Обработка изображений в тексте ========
function processImages() {
  const contentAreas = document.querySelectorAll('.content-area');
  
  contentAreas.forEach(area => {
    let html = area.innerHTML;
    const imgRegex = /\[img:([^\]]+)\]/g;
    
    html = html.replace(imgRegex, (match, imageName) => {
      if (uploadedImages[imageName]) {
        return `<div class="inserted-image">
          <img src="${uploadedImages[imageName]}" alt="${imageName}" 
               onclick="showImageModal('${imageName}')">
          <div class="image-caption">${imageName}</div>
        </div>`;
      }
      return match;
    });
    
    if (html !== area.innerHTML) {
      area.innerHTML = html;
    }
  });
}

function showImageModal(imageName) {
  if (!uploadedImages[imageName]) return;
  
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <img src="${uploadedImages[imageName]}" alt="${imageName}">
      <div class="modal-caption">${imageName}</div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// ======== Очистка всего ========
function clearAll() {
  if (!confirm("Очистить весь документ?")) return;
  
  document.getElementById("item").value = "SCP-173";
  document.getElementById("class").value = "Euclid";
  document.getElementById("date").value = "22.03.2026";
  document.getElementById("author").value = "Доктор ███████";
  
  document.getElementById("p_date").textContent = "22.03.2026";
  document.getElementById("p_author").textContent = "Доктор ███████";
  
  const pContainment = document.getElementById("p_containment");
  const pDescription = document.getElementById("p_description");
  const pAddendum = document.getElementById("p_addendum");
  
  if (pContainment) pContainment.innerHTML = "Опишите процедуры содержания здесь...";
  if (pDescription) pDescription.innerHTML = "Опишите объект здесь...";
  if (pAddendum) pAddendum.innerHTML = "Добавьте примечания, эксперименты здесь...";
  
  const container = document.getElementById('custom-categories-container');
  // Оставляем только стандартные секции, если они есть
  const standardSections = container.querySelectorAll('.section:not([data-category-name])');
  container.innerHTML = '';
  standardSections.forEach(section => container.appendChild(section));
  
  const list = document.getElementById('categories-list');
  list.innerHTML = '<div class="tool-hint" style="margin-top:0;">Нет категорий</div>';
  
  updateMetadata();
}

// ======== Защита от редактирования заголовков ========
function protectHeaders() {
  document.addEventListener('keydown', function(e) {
    const target = e.target;
    
    if (target.classList.contains('title') || 
        target.closest('.header') || 
        target.closest('.meta') ||
        target.closest('.logo')) {
      e.preventDefault();
      return false;
    }
  }, true);
  
  document.addEventListener('paste', function(e) {
    const target = e.target;
    if (target.classList.contains('title') || 
        target.closest('.header')) {
      e.preventDefault();
      return false;
    }
  }, true);
}

// ======== Инициализация стандартных секций ========
function initializeStandardSections() {
  const container = document.getElementById('custom-categories-container');
  
  // Очищаем контейнер
  container.innerHTML = '';
  
  // Создаём стандартные секции
  const sections = [
  ];
  
  sections.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section';
    
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = section.title;
    title.setAttribute('contenteditable', 'false');
    
    const content = document.createElement('div');
    content.className = 'content-area';
    content.id = section.id;
    content.setAttribute('contenteditable', 'true');
    content.style.color = '#000';
    content.innerHTML = section.content;
    
    sectionDiv.appendChild(title);
    sectionDiv.appendChild(content);
    container.appendChild(sectionDiv);
  });
}

// ======== Инициализация ========
window.addEventListener("DOMContentLoaded", function() {
  // Инициализируем стандартные секции
  initializeStandardSections();
  
  // Обновляем метаданные
  updateMetadata();
  updateImageCount();
  
  // Инициализируем список категорий
  const list = document.getElementById('categories-list');
  list.innerHTML = '<div class="tool-hint" style="margin-top:0;">Нет категорий</div>';
  
  // Слушаем изменения в метаданных
  document.getElementById("item").addEventListener("input", updateMetadata);
  document.getElementById("class").addEventListener("change", updateMetadata);
  
  document.getElementById("date").addEventListener("input", function() {
    document.getElementById("p_date").textContent = this.value || "22.03.2026";
  });
  
  document.getElementById("author").addEventListener("input", function() {
    document.getElementById("p_author").textContent = this.value || "Доктор ███████";
  });
  
  const observer = new MutationObserver(() => {
    processImages();
  });
  
  observer.observe(document.getElementById("document"), {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  protectHeaders();
  
  document.addEventListener('dblclick', function(e) {
    if (e.target.classList.contains('redacted')) {
      if (confirm('Удалить редакцию?')) {
        e.target.remove();
      }
    }
  });
  
  document.getElementById("p_date").textContent = document.getElementById("date").value;
  document.getElementById("p_author").textContent = document.getElementById("author").value;
});


