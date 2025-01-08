#!/bin/bash

# Configuration
IP_ADDRESS="127.0.0.1" # Replace with the target IP address
CHECK_INTERVAL=60        # Interval to check in seconds
UNREACHABLE_TIME=180     # Time (in seconds) before considering the server unreachable
RESTART_FREQUENCY=60     # Time (in seconds) between restarts when reachable
RESTART_DURATION=300     # Time (in seconds) to repeat restarts after becoming reachable
PM2_PROCESS_ID=6       # PM2 Process ID given to the running driver

unreachable_count=0
was_unreachable=true
restart_time_remaining=0

while true; do
  # Check if the IP is reachable
  if ping -c 1 -W 1 "$IP_ADDRESS" > /dev/null; then
    echo "Ping successful: $IP_ADDRESS"
    if $was_unreachable; then
      # First successful ping after being unreachable
      echo "$(date): Server is reachable again. Starting 5-minute PM2 restart loop."
      restart_time_remaining=$RESTART_DURATION
      was_unreachable=false
    fi

    # Handle the 5-minute restart period
    if [ $restart_time_remaining -gt 0 ]; then
      pm2 restart $PM2_PROCESS_ID
      echo "$(date): PM2 restarted. Restart time remaining: $restart_time_remaining seconds."
      restart_time_remaining=$((restart_time_remaining - RESTART_FREQUENCY))
    fi
  else
    echo "$(date): Server is unreachable."
    unreachable_count=$((unreachable_count + CHECK_INTERVAL))

    # If unreachable for at least 3 minutes, restart PM2
    if [ $unreachable_count -ge $UNREACHABLE_TIME ] && ! $was_unreachable; then
      echo "$(date): Server has been unreachable for $UNREACHABLE_TIME seconds. Restarting PM2."
      pm2 restart $PM2_PROCESS_ID
      was_unreachable=true
    fi
  fi

  # Reset unreachable count if the server is reachable
  if $was_unreachable; then
    unreachable_count=0
  fi

  # Sleep before the next check
  sleep $CHECK_INTERVAL
done

