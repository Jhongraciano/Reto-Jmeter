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

    var data = {"OkPercent": 97.05882352941177, "KoPercent": 2.9411764705882355};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.10294117647058823, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "My Addresses/index.php-96"], "isController": false}, {"data": [0.0, 500, 1500, "Home Sign In/index.php-77"], "isController": false}, {"data": [0.0, 500, 1500, "Home Sign In/index.php-77-1"], "isController": false}, {"data": [0.0, 500, 1500, "My Addresses/index.php-96-1"], "isController": false}, {"data": [0.0, 500, 1500, "Your Addresses/index.php?controller=address-104"], "isController": false}, {"data": [0.5, 500, 1500, "Home Sign In/index.php-77-0"], "isController": false}, {"data": [0.5, 500, 1500, "My Addresses/index.php-96-0"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed to Checkout/index.php?controller=order-178"], "isController": false}, {"data": [0.0, 500, 1500, "I confirm my order/index.php?fc=module&module=bankwire&controller=validation-200-1"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed To Checkout/index.php-151"], "isController": false}, {"data": [0.5, 500, 1500, "Pay By Bank Wire/index.php-196"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed to Checkout/index.php?controller=order&multi-shipping=-192"], "isController": false}, {"data": [0.0, 500, 1500, "Add New Addresses/index.php-101"], "isController": false}, {"data": [0.5, 500, 1500, "I confirm my order/index.php?fc=module&module=bankwire&controller=validation-200-0"], "isController": false}, {"data": [0.0, 500, 1500, "Add New Addresses/index.php-101-1"], "isController": false}, {"data": [0.5, 500, 1500, "Add New Addresses/index.php-101-0"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed to Checkout/index.php-184"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed to Checkout/index.php-183"], "isController": false}, {"data": [0.0, 500, 1500, " Choose a delivery address/index.php-165"], "isController": false}, {"data": [0.0, 500, 1500, "Already registered/index.php?controller=authentication-89-1"], "isController": false}, {"data": [0.5, 500, 1500, "Already registered/index.php?controller=authentication-89-0"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed to Checkout/index.php?controller=order-172"], "isController": false}, {"data": [0.0, 500, 1500, "Already registered/index.php?controller=authentication-89-2"], "isController": false}, {"data": [0.0, 500, 1500, "I confirm my order/index.php?fc=module&module=bankwire&controller=validation-200"], "isController": false}, {"data": [0.0, 500, 1500, "Already registered/index.php?controller=authentication-89"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed To Checkout 1/index.php-157"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed to Checkout/index.php?controller=order-186"], "isController": false}, {"data": [0.5, 500, 1500, "Add to Cart/index.php?rand=1654716215831-146"], "isController": false}, {"data": [0.0, 500, 1500, "Already registered/index.php?rand=1654715759491-92"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed To Checkout/index.php?rand=1654716338485-156"], "isController": false}, {"data": [0.0, 500, 1500, "Proceed to Checkout/index.php-171"], "isController": false}, {"data": [0.0, 500, 1500, "Already registered/index.php?rand=1654715759491-92-1"], "isController": false}, {"data": [0.0, 500, 1500, "Women/index.php-109"], "isController": false}, {"data": [0.0, 500, 1500, "Already registered/index.php?rand=1654715759491-92-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 34, 1, 2.9411764705882355, 2827.176470588235, 3, 7335, 2525.5, 5707.5, 6735.75, 7335.0, 0.48773490173576245, 12.739286530806199, 0.3123150821259504], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["My Addresses/index.php-96", 1, 0, 0.0, 3247.0, 3247, 3247, 3247.0, 3247.0, 3247.0, 3247.0, 0.3079765937788728, 10.85376886356637, 0.29414170773021253], "isController": false}, {"data": ["Home Sign In/index.php-77", 1, 0, 0.0, 3708.0, 3708, 3708, 3708.0, 3708.0, 3708.0, 3708.0, 0.2696871628910464, 9.509369521979503, 0.24651092233009708], "isController": false}, {"data": ["Home Sign In/index.php-77-1", 1, 0, 0.0, 2689.0, 2689, 2689, 2689.0, 2689.0, 2689.0, 2689.0, 0.3718854592785422, 12.901229546299739, 0.17359497024916326], "isController": false}, {"data": ["My Addresses/index.php-96-1", 1, 0, 0.0, 2077.0, 2077, 2077, 2077.0, 2077.0, 2077.0, 2077.0, 0.48146364949446313, 16.697008907077517, 0.2346194932595089], "isController": false}, {"data": ["Your Addresses/index.php?controller=address-104", 1, 1, 100.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 680.6640625, 0.0], "isController": false}, {"data": ["Home Sign In/index.php-77-0", 1, 0, 0.0, 1017.0, 1017, 1017, 1017.0, 1017.0, 1017.0, 1017.0, 0.9832841691248771, 0.5598190142576205, 0.4397892084562439], "isController": false}, {"data": ["My Addresses/index.php-96-0", 1, 0, 0.0, 1170.0, 1170, 1170, 1170.0, 1170.0, 1170.0, 1170.0, 0.8547008547008547, 0.4807692307692308, 0.39980635683760685], "isController": false}, {"data": ["Proceed to Checkout/index.php?controller=order-178", 1, 0, 0.0, 2017.0, 2017, 2017, 2017.0, 2017.0, 2017.0, 2017.0, 0.49578582052553294, 12.973223692364899, 0.3306852689638077], "isController": false}, {"data": ["I confirm my order/index.php?fc=module&module=bankwire&controller=validation-200-1", 1, 0, 0.0, 3076.0, 3076, 3076, 3076.0, 3076.0, 3076.0, 3076.0, 0.32509752925877766, 8.482378697984394, 0.1882644871586476], "isController": false}, {"data": ["Proceed To Checkout/index.php-151", 1, 0, 0.0, 1978.0, 1978, 1978, 1978.0, 1978.0, 1978.0, 1978.0, 0.5055611729019212, 13.230002685793732, 0.24043778437815977], "isController": false}, {"data": ["Pay By Bank Wire/index.php-196", 1, 0, 0.0, 1106.0, 1106, 1106, 1106.0, 1106.0, 1106.0, 1106.0, 0.9041591320072332, 23.691794755877034, 0.45384550180831823], "isController": false}, {"data": ["Proceed to Checkout/index.php?controller=order&multi-shipping=-192", 1, 0, 0.0, 2390.0, 2390, 2390, 2390.0, 2390.0, 2390.0, 2390.0, 0.41841004184100417, 10.873349241631798, 0.2704955543933054], "isController": false}, {"data": ["Add New Addresses/index.php-101", 1, 0, 0.0, 7335.0, 7335, 7335, 7335.0, 7335.0, 7335.0, 7335.0, 0.136332651670075, 4.805992246080436, 0.12967578391274712], "isController": false}, {"data": ["I confirm my order/index.php?fc=module&module=bankwire&controller=validation-200-0", 1, 0, 0.0, 1310.0, 1310, 1310, 1310.0, 1310.0, 1310.0, 1310.0, 0.7633587786259541, 0.43162571564885494, 0.4897721851145038], "isController": false}, {"data": ["Add New Addresses/index.php-101-1", 1, 0, 0.0, 6134.0, 6134, 6134, 6134.0, 6134.0, 6134.0, 6134.0, 0.163025758069775, 5.6552743927290505, 0.0792840112487773], "isController": false}, {"data": ["Add New Addresses/index.php-101-0", 1, 0, 0.0, 1201.0, 1201, 1201, 1201.0, 1201.0, 1201.0, 1201.0, 0.8326394671107411, 0.4683597002497918, 0.3870472522897585], "isController": false}, {"data": ["Proceed to Checkout/index.php-184", 1, 0, 0.0, 3261.0, 3261, 3261, 3261.0, 3261.0, 3261.0, 3261.0, 0.30665440049064707, 8.000565394050904, 0.14284584866605335], "isController": false}, {"data": ["Proceed to Checkout/index.php-183", 1, 0, 0.0, 2072.0, 2072, 2072, 2072.0, 2072.0, 2072.0, 2072.0, 0.48262548262548266, 12.629799861245173, 0.1899395209942085], "isController": false}, {"data": [" Choose a delivery address/index.php-165", 1, 0, 0.0, 4048.0, 4048, 4048, 4048.0, 4048.0, 4048.0, 4048.0, 0.24703557312252963, 6.442224555335969, 0.11507418787055336], "isController": false}, {"data": ["Already registered/index.php?controller=authentication-89-1", 1, 0, 0.0, 2714.0, 2714, 2714, 2714.0, 2714.0, 2714.0, 2714.0, 0.36845983787767134, 0.20833813098747236, 0.21157654753131908], "isController": false}, {"data": ["Already registered/index.php?controller=authentication-89-0", 1, 0, 0.0, 1161.0, 1161, 1161, 1161.0, 1161.0, 1161.0, 1161.0, 0.8613264427217916, 1.2961953596037898, 0.5887973729543496], "isController": false}, {"data": ["Proceed to Checkout/index.php?controller=order-172", 1, 0, 0.0, 1877.0, 1877, 1877, 1877.0, 1877.0, 1877.0, 1877.0, 0.5327650506126798, 13.943980587373469, 0.3553501265316995], "isController": false}, {"data": ["Already registered/index.php?controller=authentication-89-2", 1, 0, 0.0, 2661.0, 2661, 2661, 2661.0, 2661.0, 2661.0, 2661.0, 0.37579857196542654, 13.033311020293123, 0.223130402104472], "isController": false}, {"data": ["I confirm my order/index.php?fc=module&module=bankwire&controller=validation-200", 1, 0, 0.0, 4386.0, 4386, 4386, 4386.0, 4386.0, 4386.0, 4386.0, 0.22799817601459188, 6.077799033857729, 0.2783180859553123], "isController": false}, {"data": ["Already registered/index.php?controller=authentication-89", 1, 0, 0.0, 6536.0, 6536, 6536, 6536.0, 6536.0, 6536.0, 6536.0, 0.15299877600979192, 5.623003844094248, 0.28328679620563035], "isController": false}, {"data": ["Proceed To Checkout 1/index.php-157", 1, 0, 0.0, 4268.0, 4268, 4268, 4268.0, 4268.0, 4268.0, 4268.0, 0.23430178069353327, 6.110151124648548, 0.10914252870196814], "isController": false}, {"data": ["Proceed to Checkout/index.php?controller=order-186", 1, 0, 0.0, 2695.0, 2695, 2695, 2695.0, 2695.0, 2695.0, 2695.0, 0.37105751391465674, 9.710908511131725, 0.24749246289424862], "isController": false}, {"data": ["Add to Cart/index.php?rand=1654716215831-146", 1, 0, 0.0, 935.0, 935, 935, 935.0, 935.0, 935.0, 935.0, 1.0695187165775402, 0.7990056818181818, 0.7227606951871657], "isController": false}, {"data": ["Already registered/index.php?rand=1654715759491-92", 1, 0, 0.0, 5281.0, 5281, 5281, 5281.0, 5281.0, 5281.0, 5281.0, 0.1893580761219466, 15.323025646184435, 0.2191301955122136], "isController": false}, {"data": ["Proceed To Checkout/index.php?rand=1654716338485-156", 1, 0, 0.0, 1802.0, 1802, 1802, 1802.0, 1802.0, 1802.0, 1802.0, 0.5549389567147613, 0.4048236334628191, 0.35225617369589346], "isController": false}, {"data": ["Proceed to Checkout/index.php-171", 1, 0, 0.0, 1855.0, 1855, 1855, 1855.0, 1855.0, 1855.0, 1855.0, 0.5390835579514826, 14.063552897574125, 0.25111607142857145], "isController": false}, {"data": ["Already registered/index.php?rand=1654715759491-92-1", 1, 0, 0.0, 2961.0, 2961, 2961, 2961.0, 2961.0, 2961.0, 2961.0, 0.33772374197906113, 27.13432170297197, 0.1817243963188112], "isController": false}, {"data": ["Women/index.php-109", 1, 0, 0.0, 4834.0, 4834, 4834, 4834.0, 4834.0, 4834.0, 4834.0, 0.20686801820438558, 20.064985648531238, 0.09919159857261069], "isController": false}, {"data": ["Already registered/index.php?rand=1654715759491-92-0", 1, 0, 0.0, 2319.0, 2319, 2319, 2319.0, 2319.0, 2319.0, 2319.0, 0.43122035360068994, 0.24845703967227253, 0.2669860392410522], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: automationpractice.com:80 failed to respond", 1, 100.0, 2.9411764705882355], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 34, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: automationpractice.com:80 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Your Addresses/index.php?controller=address-104", 1, 1, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: automationpractice.com:80 failed to respond", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
