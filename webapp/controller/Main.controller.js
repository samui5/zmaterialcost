sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/m/Dialog",
	"sap/ui/unified/FileUploader",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"demo/app/matcost/model/formatter",
	"demo/app/matcost/util/jszip",
	'sap/m/MessageItem',
	'sap/m/MessageView',
	"sap/ui/table/RowSettings",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, History, Dialog, FileUploader, MessageToast, MessageBox, Filter, formatter, MessageItem, MessageView,
	RowSettings,FilterOperator) {
	"use strict";

	return Controller.extend("demo.app.matcost.controller.Main", {
		onInit: function() {
			var oJson = new JSONModel();
			oJson.setData({
				data: [],
				title: 0,
				messages: [],
				newEntry: {
					Zzlocation: "",
					Zzcostcol: "",
					Zzmatprod: "",
					Zzenddate: new Date(),
					Zzqtyprods: 0,
					Zzmatcosts: 0,
					Zzlabcosts: 0,
					Zzmchcosts: 0,
					Zzunitcosts: 0,
					Zcurrency: ""
				}
			});
			this.getView().setModel(oJson, "local");
			this.localModel = oJson;
			this.oDataModel = this.getOwnerComponent().getModel();
		},
		formatter: formatter,
		updateRecords: [],
		newRecords: [],
		deleteRecords: [],
		onLiveChange: function() {
			var sValues = this.localModel.getProperty("/newEntry");
			if (sValues.Zzqtyprods <= 0 || !sValues.Zzqtyprods) {
				return;
			}
			sValues.Zzunitcosts = (parseFloat(sValues.Zzmatcosts) + parseFloat(sValues.Zzlabcosts) + parseFloat(sValues.Zzmchcosts)) /
				parseFloat(sValues.Zzqtyprods);
			var newVal = parseFloat(sValues.Zzunitcosts).toFixed(2);
			this.localModel.setProperty("/newEntry/Zzunitcosts", newVal);
		},
		onCellChange: function(oEvent) {
			var currentRow = oEvent.getSource().getParent();
			var Zzqtyprods = currentRow.getCells()[4].getValue();
			var Zzmatcosts = currentRow.getCells()[5].getValue();
			var labor = currentRow.getCells()[6].getValue();
			var emission = currentRow.getCells()[7].getValue();
			var calcVal = parseFloat(Zzmatcosts) + parseFloat(labor) + parseFloat(emission);
			if (Zzqtyprods <= 0 || !Zzqtyprods) {
				return;
			}
			var final = parseFloat(calcVal / parseFloat(Zzqtyprods)).toFixed(2);
			currentRow.getCells()[8].setText(final);
		},
		onPopupSearch: function(oEvent) {
			if (this.inpField.indexOf("Zzmatprod") !== -1) {
				this.cityPopup.getBinding("items").filter([new Filter("Key", "EQ", "M-" + oEvent.getParameter("value"))]);
			} else {
				this.cityPopup.getBinding("items").filter([new Filter("Key", "EQ", "L-" + oEvent.getParameter("value"))]);
			}
		},
		onCancel: function() {
			var that = this;
			MessageBox.confirm("All the changes will be discarded?", function(conf) {
				if (conf == 'OK') {
					window.location.reload();
				}
			}, "Confirmation");
		},
		inpField: "",
		onFilterSearch: function() {
			var that = this;

			if (this.getView().byId("Zzmatprod").getValue() !== "") {
				this.oDataModel.read("/MatCollAllSet", {
					filters: [new Filter("Zzmatprod", "EQ", this.getView().byId("Zzmatprod").getValue())],
					success: function(data) {
						that.localModel.setProperty("/data", data.results);
						that.localModel.setProperty("/title", data.results.length);
					}
				});
			} else if (this.getView().byId("Zzlocation").getValue() !== "") {
				this.oDataModel.read("/MatCollAllSet", {
					filters: [new Filter("Zzlocation", "EQ", this.getView().byId("Zzlocation").getValue())],
					success: function(data) {
						that.localModel.setProperty("/data", data.results);
						that.localModel.setProperty("/title", data.results.length);
					}
				});
			} else if (this.getView().byId("Zzcostcol").getValue() !== "") {
				this.oDataModel.read("/MatCollAllSet", {
					filters: [new Filter("Zzcostcol", "EQ", this.getView().byId("Zzcostcol").getValue())],
					success: function(data) {
						that.localModel.setProperty("/data", data.results);
						that.localModel.setProperty("/title", data.results.length);
					}
				});
			} else if (this.getView().byId("Zzenddate").getValue() !== "") {
				this.oDataModel.read("/MatCollAllSet", {
					filters: [new Filter("Zzenddate", "EQ", this.getView().byId("Zzenddate").getValue())],
					success: function(data) {
						that.localModel.setProperty("/data", data.results);
						that.localModel.setProperty("/title", data.results.length);
					}
				});
			} else {
				this.oDataModel.read("/MatCollAllSet", {
					success: function(data) {
						// console.log(data.results);
						that.localModel.setProperty("/data", data.results);
						that.localModel.setProperty("/title", data.results.length);
					}
				});
			}

		},
		onSelectValue: function(oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem");
			var sTitle = selectedItem.getLabel();
			sap.ui.getCore().byId(this.inpField).setValue(sTitle);
			var that = this;
			if (this.inpField.indexOf("Zzmatprod") !== -1) {
				this.getView().byId("Zzlocation").setValue("");
				this.getView().byId("Zzcostcol").setValue("");
				this.getView().byId("Zzenddate").setValue("");
			} else if (this.inpField.indexOf("Zzlocation") !== -1) {
				this.getView().byId("Zzmatprod").setValue("");
				this.getView().byId("Zzcostcol").setValue("");
				this.getView().byId("Zzenddate").setValue("");
			} else if (this.inpField.indexOf("Zzcostcol") !== -1) {
				this.getView().byId("Zzlocation").setValue("");
				this.getView().byId("Zzmatprod").setValue("");
				this.getView().byId("Zzenddate").setValue("");
			} else {
				this.getView().byId("Zzmatprod").setValue("");
				this.getView().byId("Zzlocation").setValue("");
				this.getView().byId("Zzcostcol").setValue("");
			}

		},
		onSetting: function() {
			var data = {
				data: [{
					text: "Location"
				}, {
					text: "CostCollector"
				}, {
					text: "MaterialorDescription"
				}, {
					text: "EndDate"
				}, {
					text: "QuantityProduced"
				}, {
					text: "MaterialCost"

				}, {
					text: "LaborCost"
				}, {
					text: "MachineCost"
				}, {
					text: "UnitCost"
				}, {
					text: "Options"
				}]
			};
			this.localModel.setProperty("/Setting", data);
			if (!this.oPopupSetting) {
				this.oPopupSetting = new sap.ui.xmlfragment("idsettingPopup", "demo.app.matcost.fragments.settingPopup", this);
				this.oPopupSetting.setTitle("Setting");
				this.oPopupSetting.setMultiSelect(true);
				// this.oPopupSetting.setSelected(true);
				this.oPopupSetting.bindAggregation("items", {
					path: 'local>/Setting/data',
					template: new sap.m.DisplayListItem({
						// intro: "{local>city}",
						label: "{local>text}"
					})
				});
				this.getView().addDependent(this.oPopupSetting);
			}

			this.oPopupSetting.open();

		},
		onSettingOk: function(oEvent) {
			var aItems = oEvent.getParameters().selectedContexts;
			if (aItems.length === 0) {
				return;
			}
			var items = [];
			for (var i = 0; i < aItems.length; i++) {
				items.push(aItems[i].sPath);
			}
			aItems = [];
			for (i = 0; i < items.length; i++) {
				aItems.push(this.localModel.getProperty(items[i]).text);
			}
			var oItems = this.localModel.getProperty("/Setting/data");
			for (i = 0; i < oItems.length; i++) {
				for (var j = 0; j < aItems.length; j++) {
					if (oItems[i].text === aItems[j]) {
						this.getView().byId(oItems[i].text).setVisible(true);
						break;
					} else {
						this.getView().byId(oItems[i].text).setVisible(false);
					}
				}

			}
			debugger;
		},
		// onSettingCancel:function(){
		// 	debugger;
		// },
		cityPopup: null,
		onValueHelp: function(oEvent) {
			this.inpField = oEvent.getSource().getId();
			//lo_alv->set_table_for_first_display
			//MessageBox.confirm("this functionality is under construction");
			if (this.inpField.indexOf("Zzmatprod") !== -1) {
				this.cityPopup = sap.ui.xmlfragment("Zzmatprod", "demo.app.matcost.fragments.popup", this);
				this.cityPopup.bindAggregation("items", {
					path: "/MaterialSet",
					// filters: [new Filter("Text", "EQ","M-")],
					template: new sap.m.DisplayListItem({
						label: "{Key}",
						value: "{Description}"
					})
				});
				this.cityPopup.setTitle("Materials");
				this.cityPopup.setMultiSelect(false);
				this.getView().addDependent(this.cityPopup);
				this.cityPopup.open();
			} else if (this.inpField.indexOf("Zzlocation") !== -1) {
				this.cityPopup = sap.ui.xmlfragment("Zzlocation", "demo.app.matcost.fragments.popup", this);
				this.cityPopup.bindAggregation("items", {
					path: "/LocationSet",
					// filters: [new Filter("Text", "EQ","L-")],
					template: new sap.m.DisplayListItem({
						label: "{Key}",
						value: "{Text}"
					})
				});
				this.cityPopup.setTitle("Locations");
				this.cityPopup.setMultiSelect(false);
				this.getView().addDependent(this.cityPopup);
				this.cityPopup.open();
			} else if (this.inpField.indexOf("Zzcostcol") !== -1) {
				this.cityPopup = sap.ui.xmlfragment("Zzcostcol", "demo.app.matcost.fragments.popup", this);
				this.cityPopup.bindAggregation("items", {
					path: "/CostcollectorSet",
					// filters: [new Filter("Text", "EQ","L-")],
					template: new sap.m.DisplayListItem({
						label: "{Key}",
						value: "{Text}"
					})
				});
				this.cityPopup.setTitle("Cost Collector");
				this.cityPopup.setMultiSelect(false);
				this.getView().addDependent(this.cityPopup);
				this.cityPopup.open();
			}
			// else{
			// 	this.cityPopup = sap.ui.xmlfragment("demo.app.matcost.fragments.popup", this);	
			// 	this.cityPopup.bindAggregation("items",{
			// 		path: "/MatCollAllSet",
			// 		filters: [new Filter("Zzenddate", "EQ","L-")],
			// 		template: new sap.m.DisplayListItem({
			// 			label: "{Zzenddate}",
			// 			value: "{Zzenddate}"
			// 		})
			// 	});
			// 	this.cityPopup.setTitle("End Date");
			// 	this.cityPopup.setMultiSelect(false);
			// 	this.getView().addDependent(this.cityPopup);
			// 	this.cityPopup.open();
			// }
		},
		getFormattedDate: function(monthInc) {
			var dateObj = new Date();
			dateObj.setDate(dateObj.getDate());
			var dd = dateObj.getDate();
			dateObj.setMonth(dateObj.getMonth() + monthInc);
			var mm = dateObj.getMonth() + 1;
			var yyyy = dateObj.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return mm + '.' + dd + '.' + yyyy;
		},
		onUpload: function(e) {
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		},
		dateSeperator: function(oDate) {
			oDate = String(oDate);
			var n = oDate.split(" ");
			var i = "";
			oDate = i.concat(n[1], " ", n[2], " ", n[3]);

			return oDate;
		},
		dupValidator: function(material, location, collector, endDate) {
			var data = this.localModel.getProperty("/data");
			endDate = this.dateSeperator(endDate);
			for (var i = 0; i < data.length; i++) {
				var dataEndDate = this.dateSeperator(data[i].Zzenddate);
				if (data[i].Zzmatprod === material && data[i].Zzlocation === location && data[i].Zzcostcol === collector && dataEndDate ===
					endDate) {
					return false;
				}
			}
			return true;
		},
		onPressHandleSecureOkPopup: function(oEvent) {
			var sValues = this.localModel.getProperty("/newEntry");
			if (sValues.Zzmatcosts === 0 || sValues.Zzmatcosts === "" || sValues.Zzmatprod === "" || sValues.Zzcostcol === "" || sValues.Zzlocation ===
				"") {
				MessageBox.error("Please enter valid value");
				return;
			}
			var sId = oEvent.getSource().getId();
			var clonedData = JSON.parse(JSON.stringify(sValues));
			clonedData.Zzenddate = new Date(clonedData.Zzenddate);
			if (sId === "idEdit--idButton") {
				// this.editPath
				var valid = this.dupValidator(clonedData.Zzmatprod, clonedData.Zzlocation, clonedData.Zzcostcol, clonedData.Zzenddate);
				if (valid === false) {
					MessageToast.show("Data Updated");
				} else {
					clonedData.Zcurrency = "U";
					this.localModel.setProperty(this.editPath, clonedData);
					this.editPath = "";
					this.oDialogSecure.close();
				}
			} else {
				var aData = this.localModel.getProperty("/data");
				valid = this.dupValidator(clonedData.Zzmatprod, clonedData.Zzlocation, clonedData.Zzcostcol, clonedData.Zzenddate);
				if (valid === false) {
					MessageToast.show("Duplicate Data Cannot be added");
				} else {
					aData.splice(0, 0, clonedData);
					this.localModel.setProperty("/data", aData);
					this.localModel.setProperty("/title", aData.length);
					this._oDialogSecure.close();
				}

			}
			this._oDialogSecure.close();
		},
		onPressHandleSecureCopyPopup: function(oEvent) {
			var sValues = this.localModel.getProperty("/newEntry");
			if (sValues.Zzmatcosts === 0 || sValues.Zzmatcosts === "" || sValues.Zzmatprod === "" || sValues.Zzcostcol === "" || sValues.Zzlocation ===
				"") {
				MessageBox.error("Please enter valid value");
				return;
			}
			var clonedData = JSON.parse(JSON.stringify(sValues));
			clonedData.Zzenddate = new Date(clonedData.Zzenddate);

			// if(this.editPath){
			// 	clonedData.Zcurrency = "U";
			// 	this.localModel.setProperty(this.editPath, clonedData);
			// 	this.editPath = "";
			// }else

			var aData = this.localModel.getProperty("/data");
			var valid = this.dupValidator(clonedData.Zzmatprod, clonedData.Zzlocation, clonedData.Zzcostcol, clonedData.Zzenddate);
			if (valid === false) {
				MessageToast.show("Duplicate Data Cannot be added");
			} else {
				aData.splice(0, 0, clonedData);
				this.localModel.setProperty("/data", aData);
				this.localModel.setProperty("/title", aData.length);
			}
			this._oDialogSecure1.close();
		},
		onEdit: function(oEvent) {
			this.editPath = oEvent.getSource().getParent().getParent().oBindingContexts.local.sPath;
			this.localModel.setProperty(this.editPath + "/Zzenddate", new Date(this.localModel.getProperty(this.editPath).Zzenddate));
			var sValues = this.localModel.getProperty(this.editPath);
			var CloneData = JSON.parse(JSON.stringify(sValues));
			CloneData.Zzenddate = new Date(CloneData.Zzenddate);
			this.localModel.setProperty("/newEntry", CloneData);
			if (!this.oDialogSecure) {
				this.oDialogSecure = sap.ui.xmlfragment("idEdit", "demo.app.matcost.fragments.createEntry", this);
				this.getView().addDependent(this.oDialogSecure);
			}
			//jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogSecure);
			this.oDialogSecure.setTitle("Edit Record");
			this.flag = 0;
			this.oDialogSecure.open();
		},
		onDelete: function(oEvent) {
			this.editPath = oEvent.getSource().getParent().getParent().oBindingContexts.local.sPath;
			var that = this;
			MessageBox.warning("Do you want to delete the record?", {
				icon: MessageBox.Icon.INFORMATION,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(oAction) {
					if (oAction === "YES") {
						var record = that.localModel.getProperty(that.editPath);
						record.Zcurrency = "D";
						that.localModel.setProperty(that.editPath, record);
						that.getView().byId("idTable").getBinding("rows").filter([new sap.ui.model.Filter("Zcurrency", "NE", "D")]);
					} else {
						MessageToast.show("Deletion Cancelled");
					}
				}
			});
		},

		onPopupSearch1: function(oEvent) {
			debugger;
			var toBeSearched = oEvent.getParameter("value");
			// var nameOfPopup = oEvent.getParameter("itemsBinding").getPath();
			// if (nameOfPopup.indexOf("cities") !== -1) {
			if(toBeSearched===""){
				this.oPopupSetting.getBinding("items").filter([]);
			}
			else{
				var oFilter = new Filter("text", sap.ui.model.FilterOperator.Contains, toBeSearched);
				this.oPopupSetting.getBinding("items").filter([oFilter]);
			// } else {
			// 	oFilter = new Filter("name", FilterOperator.Contains, toBeSearched);
			// 	this.suppPopup.getBinding("items").filter([oFilter]);
			}
		},

		onCopy: function(oEvent) {
			this.editPath = oEvent.getSource().getParent().getParent().oBindingContexts.local.sPath;
			var item = this.localModel.getProperty(this.editPath);
			var newEntry = {
				Zzlocation: item.Zzlocation,
				Zzcostcol: item.Zzcostcol,
				Zzmatprod: item.Zzmatprod,
				Zzenddate: new Date(item.Zzenddate),
				Zzqtyprods: item.Zzqtyprods,
				Zzmatcosts: item.Zzmatcosts,
				Zzlabcosts: item.Zzlabcosts,
				Zzmchcosts: item.Zzmchcosts,
				Zzunitcosts: item.Zzunitcosts,
				Zcurrency: item.Zcurrency
			};
			this.localModel.setProperty("/newEntry", newEntry);
			if (!this._oDialogSecure1) {
				this._oDialogSecure1 = sap.ui.xmlfragment("idCopy", "demo.app.matcost.fragments.copyEntry", this);
				this.getView().addDependent(this._oDialogSecure1);
			}
			//jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogSecure);
			this._oDialogSecure1.open();

		},
		onPressHandleSecureCancelCopyPopup: function() {
			this._oDialogSecure1.close();
		},
		onPressHandleSecureCancelPopup: function() {
			if (this.flag === 0) {
				this.oDialogSecure.close();
				this.flag = 1;
			} else {
				this._oDialogSecure.close();
			}
		},

		onAddExcelData: function() {
			//This code was generated by the layout editor.
			var that = this;
			//Step 1: Create a popup object as a global variable
			if (this.fixedDialog === undefined) {
				this.fixedDialog = new Dialog({
					title: "Choose XSLX File For Upload",
					width: "60%",
					beginButton: new sap.m.Button({
						text: "Close",
						press: function(oEvent) {
							that.fixedDialog.close();
						}
					}),
					content: [
						new FileUploader("excelUploader", {
							fileType: "XLSX,xlsx",
							change: [this.onUpload, this],
							class: "sapUiLargeMargin"
						})
					]
				});
				this.getView().addDependent(this.fixedDialog);
			}
			//Step 2: Launch the popup
			this.fixedDialog.open();
		},
		formatDate: function(endDate) {
			var x = new Date(endDate);
			var mon = ('0' + (x.getMonth() + 1)).slice(-2);
			var day = ('0' + x.getDate()).slice(-2);
			var year = x.getFullYear();
			return year + mon + day;
		},
		onSearch: function(oEvent) {
			var search = oEvent.getParameter("query");
			var oFilter1 = new sap.ui.model.Filter("Zzlocation", sap.ui.model.FilterOperator.Contains, search);
			var oFilter2 = new sap.ui.model.Filter("Zzmatprod", sap.ui.model.FilterOperator.Contains, search);
			var oFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: false
			});
			this.getView().byId("idTable").getBinding("items").filter([oFilter]);
		},
		_oDialogSecure: null,
		onAdd: function(oEvent) {
			if (!this._oDialogSecure) {
				this._oDialogSecure = sap.ui.xmlfragment("idAddPopup", "demo.app.matcost.fragments.createEntry", this);
				this.getView().addDependent(this._oDialogSecure);
			}
			var newEntry = {
				Zzlocation: "",
				Zzcostcol: "",
				Zzmatprod: "",
				Zzenddate: new Date(),
				Zzqtyprods: 0,
				Zzmatcosts: 0,
				Zzlabcosts: 0,
				Zzmchcosts: 0,
				Zzunitcosts: 0,
				Zcurrency: ""
			};
			this.localModel.setProperty("/newEntry", newEntry);
			//jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogSecure);
			this._oDialogSecure.setTitle("Add New Material");
			this._oDialogSecure.open();
		},
		onSave: function() {
			var xData = this.localModel.getProperty("/data");
			var aData = JSON.parse(JSON.stringify(xData));
			debugger;
			for (var i = 0; i < aData.length; i++) {
				aData[i].Zzenddate = this.formatDate(aData[i].Zzenddate);
			}
			//var base64Str = Buffer.from(JSON.stringify(aData)).toString("base64");
			var base64Str = btoa(decodeURIComponent(JSON.stringify(aData)));
			var payload = {
				Key: "PST",
				Value: base64Str
			};
			var that = this;
			this.getView().getModel().create("/CollectorSet", payload, {
				success: function(data) {
					debugger;
					if (data.Key === "E") {
						var allErrors = JSON.parse(decodeURIComponent(atob(data.Value)));
						var allMessages = [];
						for (var i = 0; i < allErrors.length; i++) {

							allMessages.push({
								type: 'Error',
								title: 'Error message',
								description: allErrors[i],
								counter: 1
							});
						}
						var oMessageTemplate = new sap.m.MessageItem({
							type: '{type}',
							title: '{description}',
							description: '{description}',
							//subtitle: '{subtitle}',
							counter: '{counter}',

						});
						that.localModel.setProperty("/messages", allMessages);
						debugger;
						that.oMessageView = new sap.m.MessageView({
							showDetailsPageHeader: true,
							groupItems: false,
							items: {
								path: "/messages",
								template: oMessageTemplate
							}
						});
						that.oMessageView.setModel(that.localModel);
						var that2 = that;
						that.oDialog = new sap.m.Dialog({
							resizable: true,
							buttons: [new sap.m.Button({
									text: "Download"
								}),
								new sap.m.Button({
									press: function(oEvent) {
										oEvent.getSource().getParent().close();
										that2.localModel.setProperty("/messages", []);
									},
									text: "Close"
								})
							],
							content: that.oMessageView,
							state: 'Error',
							title: "Errors",
							contentHeight: "50%",
							contentWidth: "50%",
							verticalScrolling: false
						});
						that.oDialog.open();
					} else {
						MessageToast.show("Data has been saved to SAP system");
					}
				},
				error: function(oErr) {
					MessageBox.error(JSON.parse(oErr.responseText).error.message.value);
				}
			});
		},
		_import: function(file) {
			var that = this;
			var excelData = {};
			if (file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {
						type: 'binary'
					});
					workbook.SheetNames.forEach(function(sheetName) {
						// Here is your object for every sheet in workbook
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

					});
					for (var i = 0; i < excelData.length; i++) {
						excelData[i].Zzunitcosts = parseFloat((parseInt(excelData[i].Zzqtyprods) + parseInt(excelData[i].Zzlabcosts) + parseInt(
							excelData[i].Zzmchcosts)) / parseInt(excelData[i].Zzqtyprods)).toFixed(2);
						excelData[i].Zcurrency = "N";
					}
					// Setting the data to the local model 
					that.localModel.setData({
						data: JSON.parse(JSON.stringify(excelData)),
						newEntry: {
							Zzlocation: "",
							Zzcostcol: "",
							Zzmatprod: "",
							Zzenddate: new Date(),
							Zzqtyprods: 0,
							Zzmatcosts: 0,
							Zzlabcosts: 0,
							Zzmchcosts: 0,
							Zzunitcosts: 0
						}
					});
					that.localModel.refresh(true);
				};
				reader.onerror = function(ex) {
					console.log(ex);
				};
				reader.readAsBinaryString(file);
				this.fixedDialog.close();
			}
		}
	});
});