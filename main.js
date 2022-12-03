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
  // Oct/11/2010 17:00 normal format
  // query canbe any format
  // if / or - or . or space is used, it will be converted to /

  // query can be MM/DD/YY or DD/MM/YY or YY/MM/DD
  let years = [];
  let months = [];
  let days = [];

  // query
  let query = queryFormat.split(/[-./ ]/);
  for (let i = 0; i < query.length; i++) {
    years.push(query[i]);
    months.push(query[i]);
    days.push(query[i]);
  }

  // search
  let ans = [0, 0, 0];
  let search = timeFormat.split(/[-./ ]/);
  for (let i = 0; i < search.length; i++) {
    for (let j = 0; j < years.length; j++) {
      if (search[i] === years[j]) {
        ans[0] = 1;
      }
    }
    for (let j = 0; j < months.length; j++) {
      if (search[i] === months[j]) {
        ans[1] = 1;
      }
    }

    for (let j = 0; j < days.length; j++) {
      if (search[i] === days[j]) {
        ans[2] = 1;
      }
    }
  }

  // if sum is atleast 2, then it is a match
  if (ans[0] + ans[1] + ans[2] >= 2) {
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

function showContests(contests) {
  // show contests in table
  contestsTable.innerHTML = "";
  currentContests = contests;
  for (let i = 0; i < contests.length; i++) {
    let contest = contests[i];
    let row = document.createElement("tr");
    row.innerHTML = `<td>${i + 1}</td>
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
  // if / or -  or space is used, then match time else match name
  let filteredContests = [];
  if (searchString.includes("/") || searchString.includes("-")) {
    filteredContests = contests.filter((contest) => {
      return matchTime(contest.time, searchString);
    });
  } else {
    filteredContests = contests.filter((contest) => {
      return matchName(contest.name, searchString);
    });
  }
  return filteredContests;
}

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
  const searchString = e.target.value.toLowerCase();
  // min 3 characters
  if (searchString.length > 2) {
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
    //   console.log("sort", sort);

    console.log("sort", sort);
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
