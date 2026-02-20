console.log('CRM CLEAN LOADED');
window.CRMModule = {
    render: function () {
        console.log('CRM CLEAN RENDER');
        const content = document.getElementById('page-content');
        if (content) content.innerHTML = '<h2>CRM Loaded Successfully</h2>';
    }
};
