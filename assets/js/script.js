require([
	"dojo/query",
	"dojo/dom",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojox/atom/io/model",
	"dijit/Tooltip",
	"dojox/grid/DataGrid",
	"dojo/parser",
	"dojo/store/Memory",
	"dojo/data/ItemFileWriteStore",
	"dojo/on"
], function(query, dom, domAttr, domClass, domConstruct, atomModel, tooltip, DataGrid, parser, Memory, ItemFileWriteStore, on) {
	// Get activity list
	//http://redmine.davidandgoliath.com/projects/high4204/issues.atom?key=2173264169ef659e358ba91b028f9f18fccb5235
	
	// Get list of projects
	dojo.xhrGet({
		url: "service/fetch.php",
		handleAs: 'xml',
		content: { url: redmineUrl + "/projects.xml?key=" + apiKey, "contentType" : "atom" },
		load: function(xmlDoc) {
			var projects = xmlDoc.getElementsByTagName("project");
			var projectsStore = new Memory();

			// Create data store
			var columns = Array('name','identifier','created_on','updated_on');			
			for (var i in projects) {
				if (typeof projects[i] == "object") {
					var thisProject = projects[i];
					var thisProjectId = thisProject.getElementsByTagName('id')[0].childNodes[0].nodeValue;
					projectsStore.add({ id : thisProjectId });
					for (var column in columns) {
						projectsStore.get(thisProjectId)[columns[column]] = thisProject.getElementsByTagName(columns[column])[0].childNodes[0].nodeValue;
					}
				}
			}
			
			// Build Data Grid
		    var layout = [[
				{'name': 'ID', 'field': 'id', 'width': '20%'},
				{'name': 'Name', 'field': 'name', 'width': '20%'},
				{'name': 'Identifier', 'field': 'identifier', 'width': '20%'},
				{'name': 'Created On', 'field': 'created_on', 'width': '20%'},
				{'name': 'Updated On', 'field': 'updated_on', 'width': '20%'}
			]];

			var projectsListGrid = new dojox.grid.DataGrid({
				id: 'projectsListGrid',
				store: new ItemFileWriteStore({ data: { identifier : 'id', items : projectsStore.data } }),
				structure: layout,
				autoHeight: true
			}, document.createElement('div'));
			
			dojo.byId("projectsList").appendChild(projectsListGrid.domNode);
			projectsListGrid.startup();
		},
		error: function(error){
			console.log(error);
		}
	});
	
	// Get list of issues
	dojo.xhrGet({
		url: "service/fetch.php",
		handleAs: "json",
		content: { url: redmineUrl + "/issues.json?key=" + apiKey, "contentType" : "json" },
		load: function(issues) {
			//thisTooltip = issues[i].description != "" ? new tooltip({ connectId : thisRow, label : issues[i].description, position : ["above", "below"] }) : false;
			var issuesStore = new Memory({ data : issues, idProperty : "id" });

			// Build Data Grid
		    var layout = [{
				onAfterRow : function(rowIndex, cells, rowNode) {
					var thisTooltip = issuesListGrid.getItem(rowIndex) && issuesListGrid.store.getValue(issuesListGrid.getItem(rowIndex), "description") != "" ? new tooltip({ connectId: rowNode, label: issuesListGrid.store.getValue(issuesListGrid.getItem(rowIndex), "description") }) : false;
				},
				cells : [
					{'name': 'ID', 'field': 'id', 'width': '5%'},
					{'name': 'Subject', 'field': 'subject', 'width': '75%', editable : true},
					{'name': 'Status', 'field': 'status_id', 'width': '10%', 'styles': 'text-align: center;' },
					{'name': 'Total Time', 'field': 'totalTime', 'width': '10%'}
				]
			}];

			var issuesListGrid = new dojox.grid.DataGrid({
				id: 'issuesListGrid',
				store: new ItemFileWriteStore({ data: { identifier : 'id', items : issuesStore.data } }),
				structure: layout,
				autoHeight: true
			}, document.createElement('div'));
			
			dojo.byId("projectsList").appendChild(issuesListGrid.domNode);
			issuesListGrid.startup();
			on (issuesListGrid, 'applyCellEdit', function(inValue, rowIndex, inFieldIndex) {
				console.log(inValue, rowIndex, inFieldIndex);
			});
		}
	});
});