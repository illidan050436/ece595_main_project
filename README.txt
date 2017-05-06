ECE595 Team Project
(1)Source files sumbitted and contribution
	(a)The old version files contains all the files in webgl version
	index_test.html   webgl_test.html  	test1.js (Zhongyu Jiang)
	(b)In the latest version files, all html files and css files are written by Zhongyu. Zhongyu also completed the buttons and speed up/down functions in test3.js along side with link or bridge failure mode in test4.js. Zijian has written the rest part of these two js files. 
	index.html  canvas_test3.html  canvas_test4.html  template3.css (Zhongyu)
	test3.js  test4.js  (Zijian has most part, Zhongyu has the rest)
(2)Implementation in the old version
	(a)Hard coded the topology in test1.js
	(b)In drawScene function, simulate the spanning tree algorithm by first update msg for every possible path, then in bpdu_update function, based on msg received, each bridge compute their own BPDUs and mark root port accordingly
	(c)In lan_update function, based on neighbor bridge cost information, determine the min_cost bridge and designated port to select
	(d)Create and initialize the webgl element to show objects
(3)Implementation in the latest version
	(a)Clearfully designed and realized the final website UI in html files, including the scalable top/side navigation bars, bottom links to designer personal homepage and principles delivered in concise and clear manner
	(b)Wrote the CSS stylesheet as a template structure to support the elements in html files
	(c)Hard coded the topology in test3.js and test4.js, based on this topology, simulate the spanning tree algorithm on the fly
	(d)Based on the simulation, determined the movements of messages and the changes to bridge information and link states
	(e)Draw the corresponding elements/information onto the canvas based on previous results
	(f)On the second example, implement the functionality to disable link or bridge. Added required statements in test4.js to simulate the link failure model
