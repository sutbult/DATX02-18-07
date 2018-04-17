module BidList.Table.Types exposing (..)

import Bid.Types exposing
    ( Bid
    )

type alias Model =
    { bids : List Bid
    , showStatus : Bool
    }

type Msg
    = SetBids (List Bid)
    | Click Bid
