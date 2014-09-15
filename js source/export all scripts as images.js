// This should refer to the current sprite
this.children.every(
function(t) {
window.open(t.fullImage().toDataURL());
return true;
})