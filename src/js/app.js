'use strict'

const cellClick = new Audio('./src/audio/click.mp3')
const victory = new Audio('./src/audio/victory.mp3')


const field = document.querySelector('.field')
const info = document.querySelector('.info')
const start_btn = document.querySelector('.start_btn')
const timer_elem = document.querySelector('.timer')
const count_elem = document.querySelector('.count')
const scoreboard_elem = document.querySelector('.table_score')
const sound_elem = document.querySelector('.sound')
const reset_score_elem = document.querySelector('.reset_score')
let sound = true
let count = 0
let timer
let timerS = 0
let timerM = 0
const emptyCell = {}
let arrayCell = []
let randomCell = []

start_btn.addEventListener('click', start)
sound_elem.addEventListener('click', sound_on_off)
reset_score_elem.addEventListener('click', reset_result_table)
scoreboard()

// Ф-ция для старта игры
function start(){
    start_btn.style.display = 'none'
    field.style.display = 'block'
    info.style.display = 'flex'
    field.addEventListener('click',move)
    randomCell = mixedArray()
    start_timer()

    for(let i=0; i<16; i++){

        const x = i % 4
        const y = ( i-x ) / 4
    
        const value = randomCell[i]
        if(value === 0){
            emptyCell.value = 16
            emptyCell.x = x
            emptyCell.y = y
            arrayCell.push(emptyCell)
            continue
        }
    
        const cell = document.createElement('div')
        cell.classList.add('cell')
        cell.innerHTML = value
        cell.dataset.index = i
    
        cell.style.left = `${x*98+getIndent(x)}px`
        cell.style.top = `${y*98+getIndent(y)}px`
    
        field.appendChild(cell)
        
        arrayCell.push({
            value: value,
            x : x,
            y: y,
            element: cell
        })
    }

    
}

// перемещение плиток, как визуально так и логически
function move(e){
    if(!e.target.dataset.index) return

    const cell = arrayCell[e.target.dataset.index]
    
    
    //проверяем может ли быть сдвинута нажатая ячейка, если нет то выходим из ф-ции
    const check = Math.abs(cell.x-emptyCell.x) + Math.abs(cell.y-emptyCell.y)
    if (check !== 1) return


    if(sound) cellClick.play()
    count_udate()

    // Перемещение выбранной ячейки на место пустой и наоборот //
    cell.element.style.left = `${emptyCell.x*98+getIndent(emptyCell.x)}px`
    cell.element.style.top = `${emptyCell.y*98+getIndent(emptyCell.y)}px`

    const emptyX = emptyCell.x
    const emptyY = emptyCell.y

    emptyCell.x = cell.x
    emptyCell.y = cell.y

    cell.x = emptyX
    cell.y = emptyY
    // \\Перемещение выбранной ячейки на место пустой и наоборот\\ //

    // Проверка на победу //
    const isFinished = arrayCell.every((cell)=>{
        return cell.value === cell.y*4+cell.x+1
    })
    
    if(isFinished){
        if(sound) victory.play()
        alert('Вы выиграли')
        save_result_table()
        scoreboard()
        destroy()
    }
    // \\Проверка на победу\\ //

}

//получаем отступы для координат ячеек
function getIndent(index){
    return (index === 0) ? 1 : index*2+1;
}

// Обновление кол-ва сделанных ходов
function count_udate(){
    count++
    count_elem.innerHTML = count<10 ? '0'+count : count
}

// перемешиваем поле исключая невозможность выигрыша
function mixedArray(){
    let isSolvable = false
    let inversSum = 0;
    const arrayCells = [...Array(16).keys()]

    while(!isSolvable){
        arrayCells.sort(()=>Math.random()-0.5)

        for(let i=0;i<16;i++){
            if(arrayCells[i]===0){
                inversSum += 1 + ( i - (i%4) ) / 4
            }else{
                for(let j=i+1; j<16; j++){
                    if(arrayCells[i]>arrayCells[j] && arrayCells[j]!=0){
                        inversSum++ 
                    }
                }
            }
        }
        console.log(inversSum)
        if((inversSum%2) === 0){
            isSolvable = true
        }
        inversSum = 0
    }

    return arrayCells
}

// Ф-ции управления таймером
function start_timer(){
   timer = setInterval(()=>{
        timerS++
        if(timerS==60){
            timerM++
            timerS=0
        } 
        timer_elem.innerHTML = `${timerM<10?'0'+ timerM:timerM}:${timerS<10?'0'+ timerS:timerS}`
   },1000)
}
function stop_timer(){
    clearInterval(timer)
}
function reset_timer(){
    timer_elem.innerHTML = '00:00'
    timerS = 0
    timerM = 0
}
// \\\\Ф-ции управления таймером

// Удаление поля и сброс всез параметров после победы
function destroy(){
    field.removeEventListener('click', move)
    arrayCell.forEach(item=>{
        if(item.element){
            item.element.remove()
        }  
    })
    field.style.display = 'none'
    info.style.display = 'none'
    arrayCell = []
    stop_timer()
    reset_timer()
    count = 0
    count_elem.innerHTML = "00"
    start_btn.style.display = 'block'
}


// Сохранение и загрузка результатов
function save_result_table(){
    let saveArr = load_result_table()

    if(saveArr){
        saveArr.push({timerM,timerS,count})
    }else{
        saveArr = [{timerM,timerS,count}]
    }
                    
    localStorage.setItem('15shki', JSON.stringify(saveArr))
}
function load_result_table(){
    return JSON.parse(localStorage.getItem('15shki'))
}
function reset_result_table(){
    localStorage.removeItem('15shki')
    scoreboard()
}


// Получаем таблицу результатов из LocalStorage и выводим ее в HTML
function scoreboard(){
    const score_table = load_result_table()
    if(score_table){
        let score_string = `<tr>
                                <th>№</th>
                                <th>Время</th>
                                <th>Ходов сделано</th>
                            </tr>`
        score_table.forEach((item,index)=>{
            score_string += `<tr>
                                <td>${index+1}</td>
                                <td>${item.timerM<10?'0'+ item.timerM:item.timerM}:${item.timerS<10?'0'+ item.timerS:item.timerS}</td>
                                <td>${item.count}</td>
                            </tr>`
        })
        scoreboard_elem.innerHTML = score_string
    }else{
        let score_string = `<tr>
                                <th>№</th>
                                <th>Время</th>
                                <th>Ходов сделано</th>
                            </tr>
                            <tr>
                                <td>1</td>
                                <td>--:--</td>
                                <td>---</td>
                            </tr>`
        scoreboard_elem.innerHTML = score_string
    }
}

function sound_on_off(){
    sound = !sound
    sound_elem.innerHTML = sound ? '<i class="fas fa-volume-up" ></i>' : '<i class="fas fa-volume-mute"></i>'
}