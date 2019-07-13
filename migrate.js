const fs = require("fs");
const exec = require("child_process").exec;
const _optExec = {
    encoding: "utf8",
    timeout: 0,
    maxBuffer: (1024*1024)*10, //max 10G buffer
    killSignal: "SIGTERM",
    cwd: null,
    env: null
};

/**
 * getRepositoryName
 * @param {String} url 
 * @return {String} repository
 */
const getRepositoryName = (url) => {
    const urlArray = url.split('/');
    return urlArray[(urlArray.length-1)];
}

/**
 * getNameFolder
 * @param {String} repo 
 * @return {String} name
 */
const getNameFolder = (repo) => {
    return repo.replace(".git", "");
}

/**
 * addUserPassword
 * @param {String} url 
 * @param {String} user 
 * @param {String} pass
 * @return {String} stringConnection 
 */
const addUserPassword = (url, user, pass) => {
    if (url.indexOf("https://") > -1) {
        url = url.replace("https://", "");
        return `https://${user}:${pass}@${url}`;
    }
}

/**
 * shell
 * @param {String} command 
 * @return {Boolean} true
 */
const shell = async (command) => {
    return new Promise((resolve, reject) => {
        const shellExec = exec(command, _optExec);
        shellExec.stdout.on('data', (event) => {
            console.log("stdout: ", event);
        });
        shellExec.stderr.on('data', (event) => {
            console.log("stderr: ", event);
        });
        shellExec.on('exit', (code, signal) => {
            console.log("shell: ", `Fim do comando: ${code}`);
            resolve(true);
        });
        shellExec.on('error', (error) => {
            console.error('error shell: ', error);
            reject(error);
        })
    });
}

/**
 * init
 */
const init = async () => {
    try {
        const git_user = process.argv[2];
        const git_pass = process.argv[3];
        const git_repo_origin = process.argv[4];
        const git_repo_dest = process.argv[5];
        console.log("Iniciando..");
        await shell(`git clone ${addUserPassword(git_repo_origin, git_user, git_pass)}`);
        await shell(`cd ${getNameFolder(getRepositoryName(git_repo_origin))} && pwd && git fetch --all`);
        await shell(`cd ${getNameFolder(getRepositoryName(git_repo_origin))} && pwd && git remote rm origin`);
        await shell(`cd ${getNameFolder(getRepositoryName(git_repo_origin))} && pwd && git remote add origin ${addUserPassword(git_repo_dest)}`);
        await shell(`cd ${getNameFolder(getRepositoryName(git_repo_origin))} && pwd && git push origin --all`);
        await shell(`rm ${getNameFolder(getRepositoryName(git_repo_origin))} -rfv`);
        console.log("concluído..");
    } catch (error) {
        console.error("Error: ", error);
    }
}
//start project
init();
