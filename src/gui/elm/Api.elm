port module Api exposing (..)

import Browse.Bids.Types exposing (Bid)

port getBids : () -> Cmd msg

port getBidsCallback : (List Bid -> msg) -> Sub msg
