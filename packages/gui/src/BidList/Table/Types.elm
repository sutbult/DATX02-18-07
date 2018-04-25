module BidList.Table.Types exposing (..)

import Bid.Types exposing
    ( Bid
    )
import BidList.Filter.Types exposing
    ( Filter
    )

type alias Model =
    { bids : List Bid
    , showStatus : Bool
    , filter : Filter
    , page : Int
    , bidsPerPage : Int
    }

type Msg
    = SetBids (List Bid)
    | Click Bid
    | SetFilter Filter
    | SetPage Int
    | SetBidsPerPage Int
    | Noop


bidsPerPageDefaultOption : Int
bidsPerPageDefaultOption = 20


bidsPerPageOptions : List Int
bidsPerPageOptions =
    [ bidsPerPageDefaultOption
    , 50
    , 100
    , 250
    , 500
    ]
