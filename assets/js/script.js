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
	// Get list of projects
	dojo.xhrGet({
		url: "service/fetch.php",
		handleAs: 'xml',
		content: {
            'serviceName': 'getProjects'
        },
		load: function(xmlDoc) {
			var projects = xmlDoc.getElementsByTagName("project");
			var projectsStore = new Memory();

            var columns = Array("id", "name", "created_on", "updated_on" )
			// Create projects data store
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

            // Get list of issues
            dojo.xhrGet({
                url: "service/fetch.php",
                handleAs: "json",
                content: {
                    'serviceName': 'getIssues',
                    'project_id': thisProjectId
                },
                load: function(issues) {
                    // Link data from other stores to this issue
                    for (var i in issues) {
                        issues[i]['project_name'] = (projectsStore.get(issues[i]['project_id'])).name;
                        issues[i]['timer_running'] = false;
                    }

                    var issuesStore = new Memory({ data : issues, idProperty : "id" });

                    // Build Data Grid
                    var layout = [{
                        onAfterRow : function(rowIndex, cells, rowNode) {
                            var thisTooltip = issuesListGrid.getItem(rowIndex) && issuesListGrid.store.getValue(issuesListGrid.getItem(rowIndex), "description") != "" ? new tooltip({ connectId: rowNode, label: issuesListGrid.store.getValue(issuesListGrid.getItem(rowIndex), "description"), position:["above", "below"] }) : false;
                        },
                        cells : [
                            {'name': 'Project ID', 'field': 'project_id', 'hidden': true},
                            {'name': 'Project Name', 'field': 'project_name', 'width': '25%'},
                            {'name': 'Issue ID', 'field': 'id', 'width': '5%'},
                            {'name': 'Subject', 'field': 'subject', 'width': '45%', editable : true},
                            {'name': 'Status', 'field': 'status_id', 'width': '5%', 'styles': 'text-align: center;', editable: true, type: dojox.grid.cells.Select, options: [1,2,3,4] }
                        ]
                    }];

                    var issuesListGrid = new dojox.grid.DataGrid({
                        id: 'issuesListGrid',
                        store: new ItemFileWriteStore({ data: { identifier : 'id', items : issuesStore.data } }),
                        structure: layout,
                        autoHeight: true,
                        selectionMode: 'single',
                        singleClickEdit: true,
                        onRowDblClick: function(a,b,c) {
                            console.log(a,b,c);
                        }
                    }, document.createElement('div'));

                    dojo.byId("issuesList").appendChild(issuesListGrid.domNode);
                    issuesListGrid.startup();

                    /* Grid Events */
                    // Edit Issue Subject or Status ID
                    on (issuesListGrid, 'applyCellEdit', function(inValue, rowIndex, inFieldIndex) {
                        // If this is the subject or the status, push it to service
                        if (inFieldIndex == "subject" || inFieldIndex == "status_id") {
                            var thisIssueId = issuesListGrid.store.getValue(issuesListGrid.getItem(rowIndex), "id");

                            var putObject = {};
                            putObject.issue = {};
                            putObject.issue[inFieldIndex] = inValue;

                            dojo.xhrGet({
                                url: "service/fetch.php",
                                content: {
                                    'serviceName': 'putIssue',
                                    'data': dojo.toJson(putObject)
                                },
                                load: function(result) {
                                    console.log(result);
                                }
                            });
                        }
                    });
                    // Clock In/Out
                }
            });
		},
		error: function(error){
			console.log(error);
		}
	});

});
