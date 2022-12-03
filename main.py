import requests
from bs4 import BeautifulSoup
import threading
import re
import json



url = "https://codeforces.com/contests/page/{}"

data = []

def get_upcomming_contests():
    print("Getting data from {}".format(url))
    r = requests.get(url.format(1))
    soup = BeautifulSoup(r.text, 'html.parser')
    tables = soup.find_all('table')
    table = tables[0]
    
    rows = table.find_all('tr')
    print("Found {} rows".format(len(rows)))
    for row in rows:
        # check if the row is a header
        th = row.find('th')
        if th:
            continue
        
        cols = row.find_all('td')
        
        name = cols[0].text
        contest_url = url.format(1)

        time = cols[2].text.strip()
        length = cols[3].text.strip()
        participants = "0"
        # participants = re.findall(r'\d+', participants)[0]
        
        nremove = ["Virtual participation »","Enter »","\n","\r"]
        for s in nremove:
            name = name.replace(s, "")
        name = name.strip()
        
        name = name + " (Upcoming)"

        contest = {
            "name": name,
            "url": contest_url,
            "time": time.replace('\n', ' ').replace('\r', '')[:17],
            "length": length,
            "participants": participants
        }
        
        data.append(contest)
    

def get_data(url):
    print("Getting data from {}".format(url))
    r = requests.get(url)
    soup = BeautifulSoup(r.text, 'html.parser')
    tables = soup.find_all('table')
    table = tables[1]
    
    rows = table.find_all('tr')
    print("Found {} rows".format(len(rows)))
    for row in rows:
        # check if the row is a header
        th = row.find('th')
        if th:
            continue
        
        cols = row.find_all('td')
        
        name = cols[0].text
        contest_url = cols[0].find('a')['href']
        
        #     <td class="dark">Nov/21/2022<br>
        #             20:35<sup title="timezone offset" style="font-size:8px;">
        # UTC+6</sup>
        # </td>

        time = cols[2].text.strip()
        length = cols[3].text.strip()
        participants = cols[5].text.strip()
        participants = re.findall(r'\d+', participants)[0]
        
        nremove = ["Virtual participation »","Enter »","\n","\r"]
        for s in nremove:
            name = name.replace(s, "")
        name = name.strip()
        
        contest = {
            "name": name,
            "url": contest_url,
            "time": time.replace('\n', ' ').replace('\r', '')[:17],
            "length": length,
            "participants": participants
        }
        
        data.append(contest)


def main():
    threads = []
    for i in range(0,18):
        if i == 0:
            t = threading.Thread(target=get_upcomming_contests)
        else:
            t = threading.Thread(target=get_data, args=(url.format(i),))
        t.start()
        threads.append(t)
    
    for t in threads:
        t.join()
    
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write("const data = ")
        json.dump(data, f, ensure_ascii=False, indent=4)
        f.write(";")
    

if __name__ == "__main__":
    main()