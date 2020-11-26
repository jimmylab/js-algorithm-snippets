@echo Begin: %time%
node getRand.js Z:\sample.txt
@echo End: %time%

@echo=
@echo=

@echo Begin: %time%
node index.js Z:\sample.txt > nul
@echo End: %time%

@echo=
@echo=

@echo Begin: %time%
node getRand.js | node index.js > nul
@echo End: %time%


pause
