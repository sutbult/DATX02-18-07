module Password.View exposing (root)

import Html exposing (..)
import Html.Events exposing (..)
import Html.Attributes exposing (..)
import Dict

import Password.Types exposing (..)
import Bid.Types exposing
    ( currencyName
    )
import Navigation.Types


root : Model -> Html Msg
root model =
    case model.instance of
        Just instance ->
            instanceModal instance model.passwords

        Nothing ->
            div [] []


instanceModal : Instance -> PasswordDict -> Html Msg
instanceModal instance passwords =
    div [class "modal is-active"]
        [ div
            [ class "modal-background"
            ]
            []
        , div
            [ class "modal-content"
            ]
            [ div [class "box"]
                [ p []
                    [ text "You need to write the passwords to these blockchains to continue:"
                    ]
                , p [class "help is-danger"]
                    [ text instance.error
                    ]
                , div [] <|
                    List.map
                        (passwordFieldLookup instance.submitting passwords)
                        instance.promptedPasswords
                , buttonRow instance
                    <| hasIncorrectPasswords
                        instance.promptedPasswords
                        passwords
                ]
            ]
        ]


passwordFieldLookup : Bool -> PasswordDict -> String -> Html Msg
passwordFieldLookup submitting passwordDict currency =
    case Dict.get currency passwordDict of
        Just password ->
            passwordField submitting currency password

        Nothing ->
            div [] []


passwordField : Bool -> String -> Password -> Html Msg
passwordField submitting currency password =
    let
        inputId = "password-" ++ currency
        ( passwordValue
        , extraClass
        , info
        , locked
        ) =
            case password of
                UncheckedPassword passwordValue ->
                    ( passwordValue
                    , ""
                    , ""
                    , False
                    )

                IncorrectPassword passwordValue ->
                    ( passwordValue
                    , "is-danger"
                    , "Password is incorrect"
                    , False
                    )

                CorrectPassword len ->
                    ( String.repeat len "*"
                    , "is-success"
                    , ""
                    , True
                    )
        isDisabled = locked || submitting
    in
        div [class "field"]
            [ label
                [ class "label"
                , for inputId
                ]
                [ text <| currencyName currency
                ]
            , div [class "control"]
                [ input
                    [ class <| "input " ++ extraClass
                    , id inputId
                    , type_ "text"
                    , placeholder <| "password to " ++ currencyName currency
                    , value passwordValue
                    , onInput <| SetPassword currency
                    , disabled isDisabled
                    ] []
                , p
                    [ class <| "help " ++ extraClass
                    , style [("text-align", "right")]
                    ]
                    [ text info
                    ]
                ]
            ]

buttonRow : Instance -> Bool -> Html Msg
buttonRow instance invalid =
    div
        [ class "buttons is-right"
        , style [("margin-top", "20px")]
        ]
        [ cancelButton instance.submitting instance.onCancel
        , submitButton instance.submitting invalid
        ]


cancelButton : Bool -> Maybe Navigation.Types.Msg -> Html Msg
cancelButton submitting maybeCancel =
    case maybeCancel of
        Just _ ->
            button
                [ class "button"
                , onClick Cancel
                , disabled submitting
                ]
                [ text "Cancel"
                ]

        Nothing ->
            span [] []


submitButton : Bool -> Bool -> Html Msg
submitButton submitting invalid =
    let
        extraClass =
            if submitting then
                " is-loading"
            else
                ""
    in
        button
            [ class <| "button is-link" ++ extraClass
            , onClick Submit
            , disabled <| submitting || invalid
            ]
            [ text "Submit"
            ]


hasIncorrectPasswords : List String -> PasswordDict -> Bool
hasIncorrectPasswords promptedPasswords passwords =
    let
        isIncorrect password =
            case password of
                IncorrectPassword _ ->
                    True

                _ ->
                    False
        predicate currency =
            Maybe.withDefault False
                <| Maybe.map isIncorrect
                <| Dict.get currency passwords
    in
        List.any predicate promptedPasswords
