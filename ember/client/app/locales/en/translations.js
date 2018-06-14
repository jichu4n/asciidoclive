/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                           Copyright 2016 Chuan Ji                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

export default {
  title: 'AsciiDocLIVE',
  titleSuffix: ' - AsciiDocLIVE',
  header: {
    open: 'Open',
    openRecentHeader: 'Open recent',
    openScratch: 'New Document',
    openHeader: 'Open from',
    save: 'Save',
    saveHeader: 'Save',
    saveAsHeader: 'Save as new file',
    local: 'Local File',
    exportHeader: 'Export As',
    exportHtml: 'HTML',
    settings: 'Settings',
    saving: 'Saving...',
    saved: 'Saved',
    saveError: 'Could not save document',
    help: 'Help',
    cheatsheet: 'AsciiDoc Cheatsheet',
    faq: 'FAQ',
    about: 'About',
    feedback: 'Submit Feedback'
  },
  defaultTitle: 'Untitled Document',
  defaultBody: '',
  storageTypePrefix: {
    dropbox: '[Dropbox] ',
    'google-drive': '[Google Drive] '
  },
  storageType: {
    dropbox: 'Dropbox',
    'google-drive': 'Google Drive'
  },
  edit: {
    reopen: {
      title: 'Open from {{storageType}}',
      prompt: 'Would you like to open the newly saved file from ' +
        '{{storageType}}?',
      ok: 'Open from {{storageType}}',
      cancel: 'Cancel'
    }
  },
  settings: {
    syncScroll: 'Sync Scrolling',
    autoSave: 'Auto Save',
    showHtml: 'Show Output HTML',
    editorTheme: 'Editor Theme...',
    previewCodeListingTheme: 'Preview Code Listing Theme...',
    previewTheme: 'Preview Theme...',
    font: 'Fonts & Sizes...',
    editorMode: 'Key Bindings...'
  },
  confirmClose: 'The document "{{title}}" has not been saved. ' +
    'If you leave this page, all your changes will be lost. ',
  modal: {
    close: 'Close',
    faq: {
      title: 'Frequently Asked Questions'
    },
    about: {
      title: 'About'
    },
    editorTheme: {
      title: 'Editor Theme'
    },
    highlightjsTheme: {
      title: 'Preview Code Listing Theme'
    },
    font: {
      title: 'Fonts & Sizes',
      editorFont: 'Editor Font',
      editorFontPlaceholder: 'Leave blank to use default',
      editorFontSize: 'Editor Font Size',
      previewFont: 'Preview Font',
      previewFontPlaceholder: 'Leave blank to use default',
      previewFontSize: 'Preview Font Size'
    },
    editorMode: {
      title: 'Editor Key Bindings'
    }
  }
};
