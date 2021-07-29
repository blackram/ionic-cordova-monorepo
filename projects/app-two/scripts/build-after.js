const { exec } = require('child_process');
const rimraf = require('rimraf');

handleOutput = (error, stdout, stderr) => {

  if (error) {
    console.log(error.message);
  } else if (stderr) {
    console.log(stderr);
 } else {
    console.log(stdout);
  }
}

module.exports = function(context) {

  console.log('**** in build-after ****');
  console.log(context);  
    
  if (context.build.platform === 'android' || context.build.platform === 'ios') {

    console.log('**** copying assets to integrations ****');
    
    const project_dir = `${context.project.dir}`;
    
    const source_dir = `${project_dir}/../../dist/${context.build.project}`;
    const target_dir = `${project_dir}/../../integrations/${context.build.project}`;

    rimraf(`{target_dir}\www`, handleOutput);
    exec(`cp -r ${source_dir}/* ${target_dir}/www`, handleOutput);
 }

}