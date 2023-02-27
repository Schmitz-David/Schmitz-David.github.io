var listenersToAdd=2;
let table=document.getElementById('main-table');
let currencies=["EUR", "USD", "JPY", "GBP", "CNY"];
document.getElementById('add-row-button').addEventListener("click",function(){
insertNewRow();
});
addCellListeners();

function insertNewRow(){
    table.
    insertAdjacentHTML('beforeend','<tr>\
    <td class="change-type">\
                <select class="change-selection">\
                  <option value="new-fare">New fare</option>\
                  <option value="change-fare">Change fare</option>\
                  <option value="delete-fare">Delete fare</option>\
                </select>\
              </td>\
    <td class="departure-airport">\
    <input list="airport-list">\
    </td>\
    <td class="arrival-airport">\
    <input list="airport-list">\
    </td>\
    <td class="booking-class-1">\
    <input type="checkbox">\
    </td>\
    <td class="base-fare">\
    <input class="base-input" type="number">\
    </td>\
    <td class="currency">\
                  <select class="currency-selection">\
                    <option value="EUR">EUR</option>\
                    <option value="USD">USD</option>\
                    <option value="GBP">GBP</option>\
                    <option value="CNY">CNY</option>\
                    <option value="JPY">JPY</option>\
                  </select>\
                </td>\
    <td class="OW-RT">\
      OW\
    </td>\
    <td class="direct-routing">\
      Direct\
    </td>\
    <td class="transfer-routing">\
      --\
    </td>\
  </tr>');
  listenersToAdd=1;
  addCellListeners();
}
function addCellListeners(){
    var cellsRouting=document.querySelectorAll(".direct-routing");
    let tmp=listenersToAdd;
    for(let i=cellsRouting.length-1;i>=0;i--){
        if(tmp==0) break;
        tmp--;
        cellsRouting[i].addEventListener("click",function(){
            if(cellsRouting[i].innerHTML.trim()=="Direct") cellsRouting[i].innerHTML="Transfer";
            else if(cellsRouting[i].innerHTML.trim()=="Transfer") cellsRouting[i].innerHTML="Direct";
        });
    }

    var cellsOWRT=document.querySelectorAll(".OW-RT");
    tmp=listenersToAdd;
    for(let i=cellsOWRT.length-1;i>=0;i--){
        if(tmp==0) break;
        tmp--;
        cellsOWRT[i].addEventListener("click",function(){
            if(cellsOWRT[i].innerHTML.trim()=="OW") cellsOWRT[i].innerHTML="RT";
            else if(cellsOWRT[i].innerHTML.trim()=="RT") cellsOWRT[i].innerHTML="OW";
        });
    }
}