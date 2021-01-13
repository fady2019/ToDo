/* 
    --------------------------------------------------------------
    ---------------------VARIABLES--------------------------------
    --------------------------------------------------------------
*/
let modesSwitch = document.getElementById("modesSwitch"),                   // get element that change the mode
    systemMode = "light",
    tasksContainer = document.getElementById("tasks"),                      // get the element that contain the tasks
    addTaskInput = document.getElementById("typeInput"),                    // get the input that is used in add task
    clearAllBtn = document.getElementById("clearAllBtn"),                   // get the button that remove all tasks
    displayWaysBtns = document.querySelectorAll("#displayWays span"), 
    clearCompletedBtn = document.getElementById("clearCompletedTasks"),     // get the button that remove all completed tasks
    completedTaskCount,                                                     // use it to count number of the completed tasks
    removeTaskBtn,                                                          // get the button that remove a task
    checkboxBtn,                                                            // get the checkbox of a task
    intputValue,                                                            // get the value from the input
    taskContent,                                                            // get the final value that will text for the task
    taskLayers,                                                             // will contain the layers of each task(checkbox, text, removeBTN)
    tasksCount = 0,                                                         // get number of all tasks
    allTasks = [],                                                          //set all tasks
    spareArray = [],
    tasksObject = {
        systemMode,
        allTasks,
    },
    storedTasks = localStorage.getItem("newtodolist3092001");
    

/* 
    --------------------------------------------------------------
    ----------------------MAIN FUNC-------------------------------
    --------------------------------------------------------------
*/  
    if(storedTasks!=null){
        try{
            tasksObject = JSON.parse(storedTasks);
            if(typeof tasksObject != "object")
                throw "error";

            allTasks = tasksObject["allTasks"];
            systemMode = tasksObject["systemMode"];
        }catch(error){
            localStorage.removeItem("newtodolist3092001");
            allTasks = [];
            systemMode = "light";
        }

        
        if(systemMode=="light"){
            lightMode();
        }else{
            darkMode();
        }

        displayTasks(tasksContainer, allTasks, true);
        tasksCount = allTasks.length;
    }

    modesSwitch.onclick = function(){
        systemMode  = modesSwitch.getAttribute("data-mode");
        if(systemMode=="light"){
            systemMode = "dark";
            darkMode();
        }else{
            systemMode = "light";
            lightMode();
        }
    
        tasksObject["systemMode"] = systemMode;
        saveToLocalStorage(tasksObject);
    }

    addTaskInput.addEventListener("keypress", function(e){
        let key = e.keyCode || e.which;
    
        if(key == 13){//press enter
            e.preventDefault();
            intputValue = addTaskInput.value.trim();
            if(intputValue != ""){
                taskContent = intputValue;
                addTaskInput.value = "";

                taskLayers = createTask(tasksCount, taskContent);
                addTaskToArray(allTasks, taskLayers);

                displayTasks(tasksContainer, allTasks, true);

                tasksObject["allTasks"] = allTasks;
                saveToLocalStorage(tasksObject);
                backToAllTasksMenu();
            }
        }
    });

    clearAllBtn.onclick = function(){
        clearAll(allTasks);

        displayTasks(tasksContainer, allTasks, true);

        tasksObject["allTasks"] = allTasks;
        saveToLocalStorage(tasksObject);
        backToAllTasksMenu();
    } 

    displayWaysBtns.forEach(ele =>{
        ele.onclick = function(){
            spareArray = allTasks;
            allTasks = [];
            this.classList.add("active");
            let thisId = this.getAttribute("id"),
                siblings = this.parentElement.querySelectorAll(`:not(#${thisId})`);
            siblings.forEach(ele =>{
                ele.classList.remove("active");
            })

            if(thisId=="displayAll"){
                allTasks = spareArray;
            }else if(thisId=="displayActive"){
                for(let idx=0; idx<spareArray.length; idx++){
                    if(spareArray[idx].includes('data-is-completed="false"')){
                        allTasks.push(spareArray[idx]);
                    }
                }
            }else if(thisId=="displayCompleted"){
                for(let idx=0; idx<spareArray.length; idx++){
                    if(spareArray[idx].includes('data-is-completed="true"')){
                        allTasks.push(spareArray[idx]);
                    }
                }
            }

            displayTasks(tasksContainer, allTasks, true);

            allTasks = spareArray;
        }
    })

    clearCompletedBtn.onclick = function(){
        deleteCompleted(allTasks);

        if(allTasks.length>0)
            resetTasksArray(allTasks, 0);
        
        displayTasks(tasksContainer, allTasks, true);

        tasksObject["allTasks"] = allTasks;
        saveToLocalStorage(tasksObject);
        backToAllTasksMenu();
    }

/* 
    --------------------------------------------------------------
    ----------------------FUNCTIONS-------------------------------
    --------------------------------------------------------------
*/
function lightMode(){
    modesSwitch.setAttribute("data-mode", systemMode);
    modesSwitch.setAttribute("src", "./images/icon-moon.svg");
    document.body.classList.remove("dark-mode");
}

function darkMode(){
    modesSwitch.setAttribute("data-mode", systemMode);
    modesSwitch.setAttribute("src", "./images/icon-sun.svg");
    document.body.classList.add("dark-mode");
}

function createTask(tasksCount, taskContent){
    return  `<div class="task" data-is-completed="false" data-index = "${tasksCount}" tabindex="${tasksCount}">
                <div class="toDropBefore"></div>
                <span class="checkbox">
                    <span>
                        <img src="./images/icon-check.svg" alt="">
                    </span>
                </span>
                <span class="taskContent" draggable="true">${taskContent}</span> 
                <span class="removeBtn">
                    <img src="./images/icon-cross.svg" alt="">
                </span>
                <div class="toDropAfter"></div>
            </div>`;
}

function addTaskToArray(array, task){
    array.push(task);
    tasksCount++;
}

function displayTasks(parent, array, callChangingFunction){
    parent.innerHTML = "";
    array.forEach(element => {
        parent.innerHTML += element;
    });

    toMakeTasksDraggableAndDroppable(parent);
    
    if(callChangingFunction === true){
        toMakeTasksCheckable();
        toMakeTasksDeletable();
        toMakeRemoveBtnsActive();
        toMakeTasksContralable();
    }
}

function deleteTask(array, index){
    array.splice(index, 1);
    tasksCount -= 1;
}

function clearAll(array){
    array.splice(0, array.length);
    tasksCount = 0;
}

function deleteCompleted(array){
    let idx=0;
    while(idx<array.length){
        if(!array[idx].includes('data-is-completed="true"')){
            idx++;
            continue;
        }
        array.splice(idx, 1);
        tasksCount--;
    }
}

function saveToLocalStorage(something){
    localStorage.setItem("newtodolist3092001", JSON.stringify(something));
}


/// editing functions
function backToAllTasksMenu(){
    let that = displayWaysBtns[0];
    if(!that.classList.value.includes("active")){
        that.classList.add("active");
        let thisId = that.getAttribute("id"),
            siblings = that.parentElement.querySelectorAll(`:not(#${thisId})`);
        siblings.forEach(ele =>{
            ele.classList.remove("active");
        });

        //displayTasks(tasksContainer, allTasks, true);
    }
}

function resetTasksArray(array, start){
    displayTasks(tasksContainer, array, false);
    for(let idx = start; idx<array.length; idx++){
        tasksContainer.children[idx].setAttribute("data-index", idx);
        tasksContainer.children[idx].setAttribute("tabindex", idx);
        array[idx] = tasksContainer.children[idx].outerHTML;
    }
}

function toMakeRemoveBtnsActive(){
    if(allTasks.length > 0){
        clearAllBtn.classList.remove("disabled");
    }else{
        clearAllBtn.classList.add("disabled");
    }

    completedTaskCount = tasksContainer.querySelectorAll("[data-is-completed='true']").length;
    if(completedTaskCount>0){
        clearCompletedBtn.classList.remove("disabled");
    }else{
        clearCompletedBtn.classList.add("disabled");
    }
}

function toMakeTasksDeletable(){
    removeTaskBtn = document.querySelectorAll(".removeBtn");
    removeTaskBtn.forEach(ele => {
        ele.onclick = function(){
            let taskIndex = parseInt(this.parentElement.getAttribute("data-index"));
            deleteTask(allTasks, taskIndex);
            
            resetTasksArray(allTasks, taskIndex);

            displayTasks(tasksContainer, allTasks, true);

            tasksObject["allTasks"] = allTasks;
            saveToLocalStorage(tasksObject);
            backToAllTasksMenu();
        } 
    })
}

function toMakeTasksContralable(){
    tasksContainer.querySelectorAll(".task").forEach(ele =>{
        ele.addEventListener("keyup", function(e){
            if(e.keyCode == 40){//down
                pressDown(this);
            }else if(e.keyCode == 38){//up
                pressUp(this);
            }
        })
    })
}

function pressDown(ele){
    let taskIndex = parseInt(ele.getAttribute("data-index")),
        newIndex;

    if(taskIndex == (allTasks.length-1)){//last task
        newIndex = 0;
        swapping(taskIndex, newIndex);
    }else{
        newIndex = taskIndex+1;
        swapping(taskIndex, newIndex);
    }
    
    resetTasksArray(allTasks, 0);

    displayTasks(tasksContainer, allTasks, true);

    tasksObject["allTasks"] = allTasks;
    saveToLocalStorage(tasksObject);
    backToAllTasksMenu();

    tasksContainer.children[newIndex].focus();
}

function pressUp(ele){
    let taskIndex = parseInt(ele.getAttribute("data-index")),
        newIndex;

    if(taskIndex == 0){//first task
        newIndex = allTasks.length-1;
        swapping(0, newIndex);
    }else{
        newIndex = taskIndex-1;
        swapping(taskIndex, newIndex);
    }
    resetTasksArray(allTasks, 0);

    displayTasks(tasksContainer, allTasks, true);

    tasksObject["allTasks"] = allTasks;
    saveToLocalStorage(tasksObject);
    backToAllTasksMenu();

    tasksContainer.children[newIndex].focus();
}

function swapping(idx1, idx2){
    let temp = allTasks[idx1];
    allTasks[idx1] = allTasks[idx2];
    allTasks[idx2] = temp;
}

function toMakeTasksCheckable(){
    checkboxBtn = document.querySelectorAll(".checkbox");
    checkboxBtn.forEach(ele => {
        ele.onclick = function(){
            let isCompleted = this.parentElement.getAttribute("data-is-completed"),
                taskIndex = this.parentElement.getAttribute("data-index");

            if(isCompleted=="true")
                this.parentElement.setAttribute("data-is-completed", "false");
            else
                this.parentElement.setAttribute("data-is-completed", "true");

            allTasks[taskIndex] = this.parentElement.outerHTML;
            tasksObject["allTasks"] = allTasks;
            saveToLocalStorage(tasksObject);

            toMakeRemoveBtnsActive();

            backToAllTasksMenu();
        }
    })
}

function toMakeTasksDraggableAndDroppable(parent){
    parent.querySelectorAll(".task").forEach(parentEle => {
        parentEle.setAttribute("draggable", "true");

        let start, end;
        parentEle.ondragstart = function(e){
            e.dataTransfer.setData("start", e.target.getAttribute("data-index"));
            e.dataTransfer.effectAllowed = "move";
        }

        parentEle.querySelectorAll(".toDropBefore").forEach(childEle => {
            childEle.ondragover = function(e){
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                
                if( !(end == parseInt(parentEle.getAttribute("data-index"))) ){
                    end = parseInt(parentEle.getAttribute("data-index"));
                }
            }

            childEle.ondrop = function(e){
                e.preventDefault();
                start = parseInt(e.dataTransfer.getData("start"));
                
                if(start != end){
                    moveBefore(allTasks, start, end);
                    
                    resetTasksArray(allTasks, 0);
                    displayTasks(tasksContainer, allTasks, true);

                    tasksObject["allTasks"] = allTasks;
                    saveToLocalStorage(tasksObject);
                    backToAllTasksMenu();
                }
            }

            childEle.ondragenter = function(e){
                this.classList.add("over");
            }

            childEle.ondragleave = function(e){
                this.classList.remove("over");
            }
        })

        parentEle.querySelectorAll(".toDropAfter").forEach(childEle => {
            childEle.ondragover = function(e){
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";

                if( !(end == parseInt(parentEle.getAttribute("data-index"))) ){
                    end = parseInt(parentEle.getAttribute("data-index"));
                }
            }

            childEle.ondrop = function(e){
                e.preventDefault();
                start = parseInt(e.dataTransfer.getData("start"));
                
                if(start != end){
                    moveAfter(allTasks, start, end);
                    
                    resetTasksArray(allTasks, 0);
                    displayTasks(tasksContainer, allTasks, true);

                    tasksObject["allTasks"] = allTasks;
                    saveToLocalStorage(tasksObject);
                    backToAllTasksMenu();
                }
            }
            
            childEle.ondragenter = function(e){
                this.classList.add("over");
            }

            childEle.ondragleave = function(e){
                this.classList.remove("over");
            }
        })
    })
}

function moveAfter(arr, from, to){
    if(from<to){
        arr.splice(to, 0, arr.splice(from, 1)[0]);
    }else{
        arr.splice(to+1, 0, arr.splice(from, 1)[0]);
    }
}

function moveBefore(arr, from, to){
    if(from<to){
        arr.splice(to-1, 0, arr.splice(from, 1)[0]);
    }else{
        arr.splice(to, 0, arr.splice(from, 1)[0]);
    }
}