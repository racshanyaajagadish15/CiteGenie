document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const loadingElement = document.getElementById('loading');
  const mainContentElement = document.getElementById('main-content');
  const citationOutputElement = document.getElementById('citation-output');
  const citationStyleSelect = document.getElementById('citation-style');
  const copyButton = document.getElementById('copy-btn');
  const editButton = document.getElementById('edit-btn');
  const successMessage = document.getElementById('success-message');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // Metadata fields
  const metaTitle = document.getElementById('meta-title');
  const metaAuthor = document.getElementById('meta-author');
  const metaWebsite = document.getElementById('meta-website');
  const metaDate = document.getElementById('meta-date');
  const metaUrl = document.getElementById('meta-url');
  const metaAccessDate = document.getElementById('meta-access-date');

  // Simulate loading (in a real extension, this would be fetching page data)
  setTimeout(() => {
    loadingElement.style.display = 'none';
    mainContentElement.style.display = 'block';

    // Get current page info (in a real extension, this would come from the background script)
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      const url = new URL(tab.url);

      // Set metadata
      metaTitle.value = tab.title || 'Untitled Document';
      metaAuthor.value = getAuthor();
      metaWebsite.value = url.hostname;
      metaDate.value = getCurrentYear();
      metaUrl.value = tab.url;
      metaAccessDate.value = formatDate(new Date());

      // Generate initial citation
      generateCitation();
    });
  }, 1500);

  // Event listeners
  citationStyleSelect.addEventListener('change', generateCitation);
  copyButton.addEventListener('click', copyCitation);
  editButton.addEventListener('click', toggleEditMode);

  // Generate citation based on selected style
  function generateCitation() {
    const style = citationStyleSelect.value;
    const title = metaTitle.value;
    const author = metaAuthor.value;
    const website = metaWebsite.value;
    const date = metaDate.value;
    const url = metaUrl.value;
    const accessDate = metaAccessDate.value;

    let citation = '';

    switch (style) {
      case 'apa':
        citation = `${author} (${date}). ${title}. ${website}. ${url}`;
        break;
      case 'mla':
        citation = `"${title}." ${website}, ${date}, ${url}. Accessed ${accessDate}.`;
        break;
      case 'chicago':
        citation = `${author}. "${title}." ${website}. ${date}. ${url}. (Accessed ${accessDate}).`;
        break;
      default:
        citation = `Please select a citation style.`;
    }

    citationOutputElement.textContent = citation;
  }

  // Copy citation to clipboard
  function copyCitation() {
    const citation = citationOutputElement.textContent;
    navigator.clipboard.writeText(citation).then(() => {
      showSuccessMessage();
      copyButton.classList.add('glow');
      setTimeout(() => copyButton.classList.remove('glow'), 600);
    });
  }

  // Show success message with confetti
  function showSuccessMessage() {
    successMessage.classList.add('show');

    // Show confetti
    confettiCanvas.style.display = 'block';
    const confettiSettings = { target: 'confetti-canvas', max: 80, size: 1.2 };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();

    setTimeout(() => {
      successMessage.classList.remove('show');
      confetti.clear();
      confettiCanvas.style.display = 'none';
    }, 3000);
  }

  // Toggle edit mode for metadata
  function toggleEditMode() {
    const isReadOnly = metaTitle.readOnly;

    // Toggle readonly status
    metaTitle.readOnly = !isReadOnly;
    metaAuthor.readOnly = !isReadOnly;
    metaWebsite.readOnly = !isReadOnly;
    metaDate.readOnly = !isReadOnly;

    // Change button text
    editButton.textContent = isReadOnly ? 'Save Changes' : 'Edit Metadata';

    // If saving changes, regenerate citation
    if (!isReadOnly) {
      editButton.textContent = 'Edit Metadata';
      generateCitation();
    }
  }

  // Helper functions
  function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function getCurrentYear() {
    return new Date().getFullYear();
  }

  // AUTHOR SCRAPER
  function getAuthor() {
    // Try common meta tags first
    const metaAuthors = [
      'author',
      'dc.creator',
      'dcterms.creator',
      'article:author',
      'twitter:creator',
      'sailthru.author',
      'parsely-author'
    ];

    for (const name of metaAuthors) {
      const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      if (el && el.content) return el.content;
    }

    // Try common class names and selectors
    const authorSelectors = [
      '.author-name',
      '.article-author',
      '.byline',
      '[itemprop="author"]',
      '.author > a',
      '.post-author',
      '.author__name'
    ];

    for (const selector of authorSelectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) return el.textContent.trim();
    }

    // Try LinkedIn/Facebook specific patterns
    const socialAuthor = document.querySelector('.actor-name, .feed-shared-actor__name');
    if (socialAuthor) return socialAuthor.textContent.trim();

    // Fallback to domain-specific checks
    if (window.location.hostname.includes('medium.com')) {
      const mediumAuthor = document.querySelector('a[data-user-id]');
      if (mediumAuthor) return mediumAuthor.textContent.trim();
    }

    // Final fallback
    return 'Unknown Author';
  }
});
