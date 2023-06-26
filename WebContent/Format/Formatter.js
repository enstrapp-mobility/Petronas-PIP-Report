sap.ui.define(function() {

	var Formatter = {
			formatddmmyyy : function(value) {
				if (value != undefined && value != "" && value != null && value != "00000000") {
					var date = jQuery.sap.DateFormat_ddMMMyyyy.format(new Date(value.substring(0, 4)+"-"+value.substring(4, 6)+"-"+value.substring(6, 8)));
					return date;
				}else{
					return "";
				}
			},
		formatDate : function(value) {
			if (value != undefined && value != "") {
				var date = jQuery.sap.DateFormat_yyyy_mmm_dd.format(new Date(value));
				return date;
			}
		},
		formatDateMonth : function(value) {
			if (value != undefined && value != "") {
				var date = jQuery.sap.DateFormat_yyyy_MMM.format(new Date(value.substring(0, 4)+"-"+value.substring(4, 6)+"-"+value.substring(6, 8)));
				return date;
			}
		},
		StatusIcon: function(value){
			if (value != undefined && value != "") {
				var ingValue = "";
				if(value == "ACTV"){
					ingValue = "Active.PNG";
				}else if(value == "ASEQ"){
					ingValue = "SubAsset.jpeg";
				}else if(value == "AVLB"){
					ingValue = "Avaiable.PNG";
				}else if(value == "BROKEN"){
					ingValue = "Broken.PNG";
				}else if(value == "DELETE"){
					ingValue = "Deletion.PNG";
				}else if(value == "EAUS"){
					ingValue = "FromWarehouse.PNG";
				}else if(value == "ECUS"){
					ingValue = "CustomerSite.PNG";
				}else if(value == "ESTO"){
					ingValue = "InWarehouse.PNG";
				}else if(value == "INAC"){
					ingValue = "Inactive.PNG";
				}else if(value == "INST"){
					ingValue = "Installed.PNG";
				}else if(value == "MISSING"){
					ingValue = "Missing.jpg";
				}else if(value == "OPERATING"){
					ingValue = "Operating.PNG";
				}else{
					ingValue = "Verfied.PNG";
				}
//				return "/MasterDataManagement/images/"+ingValue;
				return "./images/"+ingValue;
			}
		},
		materialStatus: function(value){
			if (value != undefined && value != "") {
				var ingValue = "";
				if(value == "COMP" || value == "APPR"){
					ingValue = "green.png";
				}else if(value == "REJT" || value == "CANC"){
					ingValue = "read.png";
				}else if(value == "WAPPR"){
					ingValue = "yellow.png";
				}else{
					ingValue = "orange.png";
				}
				return "./images/"+ingValue;
			}
		},
		Required : function(value){
			if (value == "X") {
				return true;
			}else{
				return false;
			}
		},
		CheckBoxCheck: function(value){
			if (value != undefined && value != "") {
				if(value == "X"){
					return true;
				}else{
					return false;
				}
			}else{
				return false;
			}
		},
		fileSize: function(value) {
			 var Data = "";
			if(value != "" && value != undefined){
				Data = (value / 1024).toFixed(2) + ' KB';
			}
		return Data;
		},
		fileType: function(value) {
			 var Data = "";
			if(value != "" && value != undefined){
				if(value.indexOf("/") != -1){
					Data = value.split("/")[1].toUpperCase();
				}else{
					Data = value;
				}
			}
		return Data;
		}
	};
	return Formatter;
}, true);