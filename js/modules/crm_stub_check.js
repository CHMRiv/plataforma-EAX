console.log('CRM STUB CHECK: Loading...');
var CRMModule = window.CRMModule = {
    render: function () {
        console.log('CRM Render Stub');
        const c = document.getElementById('page-content');
        if (c) c.innerHTML = '<h1>CRM STUB LOADED</h1>';
        else console.error('No page-content');
    }
};
console.log('CRM STUB CHECK: Defined.');
