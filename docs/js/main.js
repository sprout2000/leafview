var screenshotOne = document.getElementById('screenshot1');
TweenLite.set(screenshotOne, { autoAlpha: 0 });
document.addEventListener('DOMContentLoaded', function () {
  TweenLite.to(screenshotOne, 1, { autoAlpha: 1 });
  TweenLite.from(screenshotOne, 1, { yPercent: 10 });
});
var link = document.getElementById('download-link');
var link2 = document.getElementById('download-link-2');
var link3 = document.getElementById('download-link-3');
var ua = navigator.userAgent;
if (ua.includes('Windows NT')) {
  link.href = 'https://www.microsoft.com/en-us/p/leafview/9p870thx6217';
  link2.href = 'https://www.microsoft.com/en-us/p/leafview/9p870thx6217';
  link3.href = 'https://www.microsoft.com/en-us/p/leafview/9p870thx6217';
}
