/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 63.75, "KoPercent": 36.25};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.58125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7, 500, 1500, "Elejir vuelo/purchase.php-9"], "isController": false}, {"data": [0.675, 500, 1500, "Elejir Ciudades/reserve.php-8"], "isController": false}, {"data": [0.125, 500, 1500, "Home Blazedemo/-4"], "isController": false}, {"data": [0.825, 500, 1500, "Ingresar Datos/confirmation.php-16"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 80, 29, 36.25, 883.5250000000003, 230, 11428, 478.0, 1792.5, 2030.8500000000001, 11428.0, 0.2745565054447987, 0.4216848749824112, 0.17776796393185507], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Elejir vuelo/purchase.php-9", 20, 4, 20.0, 578.75, 230, 2808, 415.0, 1247.5000000000011, 2732.449999999999, 2808.0, 0.06973914074404688, 0.11797083945003713, 0.04821807778006367], "isController": false}, {"data": ["Elejir Ciudades/reserve.php-8", 20, 6, 30.0, 620.7500000000001, 236, 1885, 384.0, 1776.2000000000003, 1880.1499999999999, 1885.0, 0.07024099686022744, 0.10501509193668478, 0.04458657027260531], "isController": false}, {"data": ["Home Blazedemo/-4", 20, 17, 85.0, 1841.6499999999999, 489, 11428, 1415.5, 2457.700000000001, 10981.849999999993, 11428.0, 0.07003389640586044, 0.10173038985243857, 0.030277349549682045], "isController": false}, {"data": ["Ingresar Datos/confirmation.php-16", 20, 2, 10.0, 492.95, 238, 1793, 354.5, 1427.200000000002, 1779.35, 1793.0, 0.06976492707820997, 0.10494375529777414, 0.05800231510550201], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.588 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 643 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.788 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 955 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.793 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.297 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.692 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.483 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 2.032 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.622 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 2.505 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 756 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 765 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.520 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.334 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.670 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 899 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 802 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.541 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 2.808 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 615 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.348 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.886 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.885 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 893 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 2.009 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 720 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}, {"data": ["La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.340 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, 3.4482758620689653, 1.25], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 80, 29, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.588 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 643 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.788 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 955 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.793 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Elejir vuelo/purchase.php-9", 20, 4, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 615 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 802 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 2.808 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.297 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, null, null], "isController": false}, {"data": ["Elejir Ciudades/reserve.php-8", 20, 6, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.885 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 643 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.670 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.788 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 756 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1], "isController": false}, {"data": ["Home Blazedemo/-4", 20, 17, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.334 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.588 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 899 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host closed connection during handshake", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.541 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1], "isController": false}, {"data": ["Ingresar Datos/confirmation.php-16", 20, 2, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.520 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, "La operaci&oacute;n dur&oacute; demasiado: tard&oacute; 1.793 milisegundos, cuando no deber&iacute;a haber tardado m&aacute;s de 600 milisegundos.", 1, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
