const monthMap = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

class DefaultDict {
  constructor(defaultVal) {
    return new Proxy(
      {},
      {
        get: (target, name) => (name in target ? target[name] : defaultVal),
      }
    );
  }
}

class Contest {
  constructor(name, url, time, length, participants) {
    this.name = name;
    this.url = url;
    this.time = time; //	Jan/05/2023 17:35
    this.length = length;
    this.participants = participants;
  }

  getUrl() {
    if (this.url[0] == "h") {
      return this.url;
    } else {
      return "https://codeforces.com" + this.url;
    }
  }

  getMonthDayYearHourMinute() {
    let dateHour = this.time.split(" ");
    let month = monthMap[dateHour[0].split("/")[0]];
    let day = dateHour[0].split("/")[1];
    let year = dateHour[0].split("/")[2];
    let hour = dateHour[1].split(":")[0];
    let minute = dateHour[1].split(":")[1];
    return [month, day, year, hour, minute];
  }

  getTimeLink() {
    let date = this.getMonthDayYearHourMinute();
    return `https://www.timeanddate.com/worldclock/fixedtime.html?day=${date[1]}&month=${date[0]}&year=${date[2]}&hour=${date[3]}&min=${date[4]}&sec=0&p1=166`;
  }
}

function matchName(name, query) {
  // only letters and numbers
  let freshName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  let freshQuery = query.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  // match
  if (freshName.includes(freshQuery)) {
    return true;
  }
}

function matchTime(timeFormat, queryFormat) {
  //   console.log("queryFormat", queryFormat);
  // Oct/11/2010 17:00 normal format
  // queryFormat mm/dd/yyyy

  // check if " " is present then match time and name

  let time = timeFormat.split(" ")[0].split("/");
  let query = queryFormat.split("/");

  // check if query[0] is alphabets
  if (isNaN(query[0])) {
    let v = query[0].slice(0, 3);
    v = v.charAt(0).toUpperCase() + v.slice(1);
    query[0] = monthMap[v];
  }

  let tmonth = parseInt(monthMap[time[0]]);
  let tday = parseInt(time[1]);
  let tyear = parseInt(time[2]) % 2000;

  let qmonth = parseInt(query[0]);
  let qday = parseInt(query[1]);
  let qyear = parseInt(query[2]) % 2000;

  if (qmonth == tmonth && !qday && !qyear) {
    return true;
  } else if (qmonth == tmonth && qday == tday && !qyear) {
    return true;
  } else if (qmonth == tmonth && !qday && qyear == tyear) {
    return true;
  } else if (qday == tday && !qmonth && !qyear) {
    return true;
  } else if (qday == tday && !qmonth && qyear == tyear) {
    return true;
  } else if (qyear == tyear && !qmonth && !qday) {
    return true;
  }

  let ans = 0;

  if (Math.abs(qmonth - tmonth) <= 1) {
    ans += 1;
  }
  if (Math.abs(qday - tday) <= 10) {
    ans += 1;
  }
  if (qyear == tyear) {
    ans += 1;
  }

  if (ans == 3) {
    return true;
  }

  return false;
}

function mergeSort(unsortedContests, col, asc = false) {
  if (unsortedContests.length <= 1) {
    return unsortedContests;
  }

  const middle = Math.floor(unsortedContests.length / 2);

  const left = unsortedContests.slice(0, middle);
  const right = unsortedContests.slice(middle);

  return merge(mergeSort(left, col, asc), mergeSort(right, col, asc), col, asc);
}

function merge(left, right, col, asc) {
  let resultArray = [],
    leftIndex = 0,
    rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (asc) {
      if (left[leftIndex][col] < right[rightIndex][col]) {
        resultArray.push(left[leftIndex]);
        leftIndex++;
      } else {
        resultArray.push(right[rightIndex]);
        rightIndex++;
      }
    } else {
      if (left[leftIndex][col] > right[rightIndex][col]) {
        resultArray.push(left[leftIndex]);
        leftIndex++;
      } else {
        resultArray.push(right[rightIndex]);
        rightIndex++;
      }
    }
  }

  return resultArray
    .concat(left.slice(leftIndex))
    .concat(right.slice(rightIndex));
}

const contests = [];

// get contests from data
data.forEach((contest) => {
  contests.push(
    new Contest(
      contest.name,
      contest.url,
      contest.time,
      contest.length,
      contest.participants
    )
  );
});

// main.js
const totalContestsNo = document.getElementById("total-contests");
const contestsTable = document.getElementById("contests");
const search = document.getElementById("search");
let currentContests = contests;
let loaded = false;
let searching = false;
let currentSearchQuery = "";
let previousSearchQuery = new DefaultDict(0);
let MAX_SEARCH_QUERY = 20;

function showContests(contests) {
  // show contests in table
  contestsTable.innerHTML = "";
  currentContests = contests;
  for (let i = 0; i < contests.length; i++) {
    let contest = contests[i];
    let row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="${contest.getUrl()}" target="_blank">${contest.name}</a></td>
      <td><a href="${contest.getTimeLink()}" target="_blank">${
      contest.time
    }</a></td>
      <td>${contest.length}</td>
      <td>${contest.participants}</td>`;
    contestsTable.appendChild(row);
  }

  // show total contests
  totalContestsNo.innerHTML = contests.length;
}

sortContests("time", false);
showContests(contests);

// advanced search
function advancedSearch(contests, searchString) {
  if (previousSearchQuery[searchString] != 0) {
    return previousSearchQuery[searchString];
  }

  if (searching) {
    return;
  }

  // if / or -  or space is used, then match time else match name
  searching = true;
  let filteredContests = [];
  let isNot = false;
  let isNotq = "";
  if (searchString.includes("not ")) {
    isNot = true;
    isNotq = searchString.split("not ")[1];
    let replacev = "not " + isNotq;
    searchString = searchString.replace(replacev, "");
  }

  if (searchString.includes(" or ")) {
    // or
    let queries = searchString.split(" or ");
    for (let i = 0; i < queries.length; i++) {
      let query = queries[i];
      // time and name
      if (query.includes(" ") && query.includes("/")) {
        let splits = query.split(" ");
        let time = splits[splits.length - 1];
        let name = splits.slice(0, splits.length - 1).join(" ");
        for (let j = 0; j < contests.length; j++) {
          let contest = contests[j];
          if (matchTime(contest.time, time) && matchName(contest.name, name)) {
            filteredContests.push(contest);
          }
        }
      } else if (query.includes("/")) {
        // time
        for (let j = 0; j < contests.length; j++) {
          let contest = contests[j];
          if (matchTime(contest.time, query)) {
            filteredContests.push(contest);
          }
        }
      } else {
        // name
        for (let j = 0; j < contests.length; j++) {
          let contest = contests[j];
          if (matchName(contest.name, query)) {
            filteredContests.push(contest);
          }
        }
      }
    }
  } else if (searchString.includes("/") && searchString.includes(" ")) {
    // match time and name
    let splits = searchString.split(" ");
    // time is last
    let time = splits[splits.length - 1];
    let name = splits.slice(0, splits.length - 1).join(" ");
    for (let i = 0; i < contests.length; i++) {
      let contest = contests[i];
      if (matchName(contest.name, name) && matchTime(contest.time, time)) {
        filteredContests.push(contest);
      }
    }
  } else if (searchString.includes("/") || searchString.includes("-")) {
    filteredContests = contests.filter((contest) => {
      return matchTime(contest.time, searchString);
    });
  } else if (searchString.length > 2) {
    filteredContests = contests.filter((contest) => {
      return matchName(contest.name, searchString);
    });
  }
  if (isNot) {
    let filteredContests2 = [];
    if (isNotq.includes("/") && isNotq.includes(" ")) {
      // match time and name
      let splits = isNotq.split(" ");
      // time is last
      let time = splits[splits.length - 1];
      let name = splits.slice(0, splits.length - 1).join(" ");
      for (let i = 0; i < filteredContests.length; i++) {
        let contest = filteredContests[i];
        if (!matchName(contest.name, name) && !matchTime(contest.time, time)) {
          filteredContests2.push(contest);
        }
      }
    } else if (isNotq.includes("/") || isNotq.includes("-")) {
      filteredContests2 = filteredContests.filter((contest) => {
        return !matchTime(contest.time, isNotq);
      });
    } else {
      filteredContests2 = filteredContests.filter((contest) => {
        return !matchName(contest.name, isNotq);
      });
    }
    filteredContests = filteredContests2;
  }

  previousSearchQuery[searchString] = filteredContests;
  // if previous search query is more than 10, then remove the oldest one
  if (Object.keys(previousSearchQuery).length > MAX_SEARCH_QUERY) {
    let keys = Object.keys(previousSearchQuery);
    delete previousSearchQuery[keys[0]];
  }

  searching = false;
  return filteredContests;
}

// function search(contests, query) {

// }

// sort by name, time, length, participants
function sortContests(sort, asc = false) {
  // if sort is time then sortbytime function is called
  if (sort === "time") {
    sortByTime(currentContests, asc);
  } else if (sort == "no.") {
    currentContests.reverse();
  } else {
    currentContests = mergeSort(currentContests, sort, asc);
  }
}

// sort by time
function sortByTime(contests, asc = false) {
  // Oct/11/2010 17:00
  contests.sort((a, b) => {
    let aTime = a.time.split(" ");
    let bTime = b.time.split(" ");

    let aDate = aTime[0].split("/");
    let bDate = bTime[0].split("/");
    let aYear = aDate[2];
    let bYear = bDate[2];

    let aMonth = aDate[0];
    let bMonth = bDate[0];
    let aDay = aDate[1];

    let bDay = bDate[1];
    let aHour = aTime[1].split(":")[0];
    let bHour = bTime[1].split(":")[0];
    let aMinute = aTime[1].split(":")[1];
    let bMinute = bTime[1].split(":")[1];

    if (asc) {
      return (
        aYear +
        monthMap[aMonth] +
        aDay +
        aHour +
        aMinute -
        (bYear + monthMap[bMonth] + bDay + bHour + bMinute)
      );
    } else {
      return (
        bYear +
        monthMap[bMonth] +
        bDay +
        bHour +
        bMinute -
        (aYear + monthMap[aMonth] + aDay + aHour + aMinute)
      );
    }
  });
}

// remove other active buttons
function removeOtherActiveButtons(button) {
  const buttons = document.querySelectorAll(".sort");
  buttons.forEach((btn) => {
    if (btn != button) {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline-secondary");
    }
  });
}

// event listeners
// search bar event listener
search.addEventListener("keyup", (e) => {
  const searchString = e.target.value.toLowerCase().trim();
  // min 3 characters
  if (searchString.length > 0) {
    if (searchString == currentSearchQuery) {
      return;
    }
    currentSearchQuery = searchString;
    const filteredContests = advancedSearch(contests, searchString);
    if (filteredContests) {
      showContests(filteredContests);
    }
  } else {
    showContests(contests);
    sortContests("time", false);
  }
});

// add event listeners to sort buttons
const sortButtons = document.querySelectorAll(".sort");
sortButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    let sort = e.target.parentElement.parentElement.innerText.toLowerCase();
    const asc = e.target.classList.contains("bi-sort-up");
    sortContests(sort, asc);
    showContests(currentContests);
    if (asc) {
      e.target.classList.remove("bi-sort-up");
      e.target.classList.add("bi-sort-down");
      e.target.classList.remove("btn-primary");
      e.target.classList.add("btn-outline-secondary");
    } else {
      e.target.classList.remove("bi-sort-down");
      e.target.classList.add("bi-sort-up");

      e.target.classList.remove("btn-outline-secondary");
      e.target.classList.add("btn-primary");
      removeOtherActiveButtons(e.target);
    }
  });
});

// search guide
const searchGuideButton = document.querySelector("#search-guide-button");
searchGuideButton.addEventListener("click", () => {
  searchGuideButton.classList.toggle("d-none");
  showSearchGuide();
});

function showSearchGuide() {
  let guide = `
    <h4>Search for contests by name, date</h4>
    <h5>Examples:</h5>
    div4 MM/DD/YYYY
    div4 10/10/2020
    div4 10//2020
    div4 //2020
    div4 //22
    div3 feb/
    div4 or div3
    div4 or div3 not upcoming
    div4 or div3 not //2020
    `;
  // add text-muted to every line
  guide = guide
    .split("\n")
    .map((line) => {
      return `<p class="text-muted">${line}</p>`;
    })
    .join("");

  // show search guide in black not with white text, "or","not" should be in red

  // show modal
  // create modal on the fly
  const modal = `
    <div class="modal fade" id="searchGuideModal" tabindex="-1" aria-labelledby="searchGuideModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="searchGuideModalLabel">Search Guide</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ${guide}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
                </div>
                </div>
                </div>
                `;

  // add modal to body
  document.body.innerHTML += modal;
  // show modal

  const searchGuideModal = new bootstrap.Modal(
    document.getElementById("searchGuideModal")
  );
  searchGuideModal.show();
}
