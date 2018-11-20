#!/usr/bin/env bash

# a NOT fully featured, simple screensaver script for the poor linux users
#      who are not really convinced of xscreensaver & co
# this script is supposed to be started via cron. just call it every minute.
#       * * * * * /home/$USER/bin/screensaver.sh
# it checks inactivity with xprintidle  and starts roloviewer as normal app.
# roloviewer will exit at the first mouse move or key press (arg: --screensaver)
# tested only with one screen! roloviewer will appear only on one screen!
# debugging script via: tail -F /home/$USER/screensaver.sh.log

# steps.
#   1. prepare a configuation file ($HOME/.config/RoloViewer/screensaver.ini; copy the standard config)
#   2. install xprintidle (ubuntu: sudo apt-get install xprintidle)
#   3. check the config section (below)

#-------------------------------------------------------------------
# config section

# set USER

ROLO_APP="/home/$USER/bin/roloviewer-0.7.3-x86_64.AppImage"

ROLO_COMMAND="$ROLO_APP --configfile $HOME/.config/RoloViewer/screensaver.ini --fullscreen --play --screensaver"
# wait ... seconds before start roloviewer
TIME_WAIT_SECONDS=180

# just add the app names which should prevent roloviewer to be started (ps | grep)
CHECK_RUNNING_APP_LIST=(
    "$ROLO_APP"
    vlc
    smplayer
)

ENABLE_DEBUG_OUTPUT=1
SCRIPTNAME=$(basename "$0")
LOGFILE="${HOME}/${SCRIPTNAME}.log"

# set specific display - needed by xprintidle
export DISPLAY=:0

#-------------------------------------------------------------------
# implementation

FIRST_OUTPUT=0

function debug_output() {

    if [ $ENABLE_DEBUG_OUTPUT -eq 1 ] ; then
        if [ $FIRST_OUTPUT -eq 0 ] ; then
            FIRST_OUTPUT=1
            rm $LOGFILE >/dev/null 2>&1
        fi

        echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >>$LOGFILE
    fi
}

# check if xprintidle exists
type xprintidle >/dev/null 2>&1
RC=$?
if [ $RC -ne 0 ] ; then
    debug_output "xprintidle does not exist => do nothing (maybe do some proper error handling)"
    exit 0
fi

TIME_WAIT_MS=$((1 + $TIME_WAIT_SECONDS * 1000))
TIME_IDLE=$(xprintidle)

debug_output "TIME_WAIT_MS=$TIME_WAIT_MS; TIME_IDLE=$TIME_IDLE"
if [ $TIME_IDLE -lt $TIME_WAIT_MS ] ; then
    # time not reached => do nothing
    debug_output "time not reached"
    exit 0
fi


for CHECK_APP in ${CHECK_RUNNING_APP_LIST[@]}; do
    COUNT_HITS=$(ps aux | grep "$CHECK_APP" | grep -v -e "grep" -e "$SCRIPTNAME" | wc -l)
    if [ $COUNT_HITS -gt 0 ] ; then
        # app seems to be running => skip
        debug_output "\"$CHECK_APP\" seem to be running => skip"
        exit 0
    fi
done

debug_output "start: $ROLO_COMMAND"
#nohup $ROLO_COMMAND >/dev/null 2>&1 &
$ROLO_COMMAND >/dev/null 2>&1
debug_output "exit"
exit 0
