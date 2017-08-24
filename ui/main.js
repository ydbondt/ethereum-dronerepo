export function configure(aurelia) {
    aurelia.use
      .standardConfiguration()
      .developmentLogging()
      .plugin('aurelia-bootstrap');
      
  
    aurelia.start().then(() => aurelia.setRoot());
  }