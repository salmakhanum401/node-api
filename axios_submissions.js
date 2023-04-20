const axios  = require("axios")

const ELASTICSEARCH_HOST = "http://10.180.241.109:9200";
const INDEX = "/prod_submission"
const SEARCH_ENDPOINT = "/_search";

const START_DATE = "2023-04-16";
const END_DATE = "2023-04-17";

const ELASTICSEARCH_QUERY = {
    "size": 100,
    "_source": {
        "includes": [
            "submissionId",
            "revision",
            "status",
            "updated_date",
            "auditLogs.date",
            "auditLogs.status"
        ]
    },
    "query": {
        "bool": {
            "must": [
                {
                    "range": {
                        "updated_date": {
                            "gte": START_DATE,
                            "lt": END_DATE
                        }
                    }
                }
            ]
        }
    }
};

let allRecords = [];
let submissions = [];

axios.get(ELASTICSEARCH_HOST + INDEX + SEARCH_ENDPOINT + "?scroll=10m", {
    data: JSON.stringify(ELASTICSEARCH_QUERY)
})
.then(function getMoreRecords(res) {
    const body = res.data
    let hits = body['hits']['hits'];
        hits.forEach(function (hit) {
            allRecords.push(hit._source);
        });
        console.log("Completed ", allRecords.length);
        if (body.hits.total !== allRecords.length) {
            axios.post(ELASTICSEARCH_HOST + SEARCH_ENDPOINT + "/scroll", {
                data: JSON.stringify({
                    "scroll" : "10m",                                                                 
                    "scroll_id" : body._scroll_id
                })
            }).then(getMoreRecords);
        } else {
            allRecords.forEach(record => {
                submissions.push(record);
            });
        
            submissions.forEach(submission => {
                for(let auditLog of submission.auditLogs) {
                    if(auditLog.status == "COMPLETED" || auditLog.status == "REVISION_COMPLETED" || auditLog.status == "SENT_BACK_COMPLETED" || auditLog.status == "RESUBMISSION_COMPLETED") {
                        if(auditLog.date.includes(START_DATE)) {
                            print(submission.submissionId, submission.revision, auditLog.date, auditLog.status, submission.updated_date, submission.status);
                        }
                    }
                }
            });
        }
})
.catch((error) => {
    console.log("Error: ", error)
})


function print(submissionId, revision, completedDate, completedStatus, latestUpdateddate, currentStatus) {
    console.log(submissionId, ",", revision, ",", completedDate, ",", completedStatus, ",", latestUpdateddate, ",", currentStatus);
}