document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  const detailView = document.getElementById('image-detail');
  const backBtn = document.querySelector('.back-btn');
  const expandedImg = document.getElementById('expanded-img');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.querySelector('img').src;
      const loc = card.querySelector('.location').innerText;
      const cat = card.querySelector('.category').innerText;

      // Populate Data
      expandedImg.src = src;
      document.getElementById('detail-location').innerText = loc;
      document.getElementById('detail-category').innerText = cat;
      
      // Open View
      detailView.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  backBtn.addEventListener('click', () => {
    detailView.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
});
const openUpload = document.getElementById('open-upload');
const closeUpload = document.getElementById('close-upload');
const uploadModal = document.getElementById('upload-modal');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

// Open/Close Logic
openUpload.addEventListener('click', () => uploadModal.classList.add('active'));
closeUpload.addEventListener('click', () => uploadModal.classList.remove('active'));

// Trigger file input when clicking drop zone
dropZone.addEventListener('click', () => fileInput.click());

// Close modal if clicking outside the card
uploadModal.addEventListener('click', (e) => {
    if(e.target === uploadModal) uploadModal.classList.remove('active');
});
