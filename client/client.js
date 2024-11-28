if (location.host.includes('localhost')) {
  // Load livereload script if we are on localhost
  document.write(
    '<script src="http://' +
      (location.host || 'localhost').split(':')[0] +
      ':35729/livereload.js?snipver=1"></' +
      'script>'
  )
}

// Automatic redirect to login
if (window.location.pathname !== '/login') {
  window.location.href = '/login';
}

console.log('This is a Test');
