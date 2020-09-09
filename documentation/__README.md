## Intro

This documentation folder contains a clone of this project's **wiki** repo.

It has been pulled into this main repo using `git subtree`, using the guide shown [here](https://gist.github.com/yukoff/5220f33123de5e7e428db63ef7025e72).

More info about subtrees [here](https://www.atlassian.com/git/tutorials/git-subtree).

If you are wanting to be able to push/pull back to the wiki repo, please run the following after cloning this project to set the wiki repo as a remote:  
`git remote add wiki https://github.com/openmsupply/application-manager-server.wiki.git`  
(I think each installation needs to do this seperately, maybe someone can test and confirm?)

To push (publish) changes from this repo to the wiki:  
`yarn push_docs`

To pull (update from wiki) into this repo:  
`yarn pull_docs`  
(Try to avoid this -- make most changes locally)

### File/Folder structure and links

- Page (.md) files should have hyphens instead of spaces, e.g. `Database-Schema.md`, which will show on the wiki with the page title **Database Schema**.
- All page folders stay in top (documentation) folder.
- Please keep images in the `images` folder and prefix them with the name of the page they appear (in lower case).
- Links to other pages take the form `[Text to display](Page-name)`. (Note that the extention `.md` is not required.)
- Links to images take the form `images/filename.ext`.

### Some caveats (make sure you read this):

- Please only **push** to the wiki repo from the `master` branch of this project. This will ensure that only approved and merged changes get published in the wiki.
- Ensure that documentation files are always committed seperately from other project files. (Individual commits should never contain both files from inside and outside the docs directory.)
- If you edit the wiki directly (on Github), please **pull** back into this repo immediately after.
